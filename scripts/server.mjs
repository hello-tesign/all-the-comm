import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, createHash, timingSafeEqual, scryptSync } from 'node:crypto';

const ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const ADMIN = path.join(ROOT, 'src', 'admin');
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, '.private', 'server'));
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const LOCAL = ['127.0.0.1', '::1', 'localhost'].includes(HOST);
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ? new URL(process.env.PUBLIC_ORIGIN).origin : '';
const SECURE = PUBLIC_ORIGIN.startsWith('https://');
const MAX_BODY = 15 * 1024 * 1024;
const MAX_FILE = 3 * 1024 * 1024;
const MAX_FILES = 3;
const STORE_PATH = path.join(DATA, 'store.json');
const LOCK_PATH = path.join(DATA, 'server.lock');
const services = [
  ['strategy', '전략·브랜딩'], ['digital', '디지털 마케팅'], ['content', '콘텐츠·디자인'],
  ['video', '영상 제작'], ['media', '미디어·오프라인 광고'], ['influencer', '인플루언서 마케팅'],
  ['hospital', '병원 마케팅'], ['consulting', '사업·글로벌 컨설팅'], ['it', 'IT 솔루션 지원'], ['pr', '언론홍보'], ['other', '기타']
].map(([id, name]) => ({ id, name }));
const serviceIds = new Set(services.map(s => s.id));
const englishFields = { clientEn:160, typeEn:100, industryEn:120, scopeEn:1500, problemEn:10000, strategyEn:10000, executionEn:10000, resultEn:10000 };
const sessions = new Map();
const limits = new Map();
let store, server, queue = Promise.resolve();
let passwordHash;
const passwordSalt = randomBytes(32);
const lockToken = randomUUID();

class ApiError extends Error {
  constructor(status, message, fields = {}) { super(message); this.status = status; this.fields = fields; }
}
const fail = (status, message, fields) => { throw new ApiError(status, message, fields); };
const sha = value => createHash('sha256').update(value).digest('hex');
const isWithin = (base, target) => target === base || target.startsWith(base + path.sep);
const now = () => new Date().toISOString();
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const textField = (data, key, max, required = false) => {
  const value = typeof data[key] === 'string' ? data[key].trim() : '';
  if ((required && !value) || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(422, '입력 내용을 확인해 주세요.', { [key]: `${required ? '필수 입력입니다. ' : ''}최대 ${max}자까지 입력할 수 있습니다.` });
  return value;
};

async function atomicWrite(filename, value) {
  const temp = filename + '.' + randomUUID() + '.tmp';
  const handle = await fs.open(temp, 'wx', 0o600);
  try { await handle.writeFile(JSON.stringify(value, null, 2), 'utf8'); await handle.sync(); }
  finally { await handle.close(); }
  try { await fs.rename(temp, filename); }
  catch (error) { await fs.unlink(temp).catch(() => {}); throw error; }
  // Directory sync adds durability where the operating system supports it.
  let directory;
  try { directory = await fs.open(path.dirname(filename), 'r'); await directory.sync(); }
  catch {}
  finally { if (directory) await directory.close().catch(() => {}); }
}

function transaction(fn) {
  const run = queue.then(async () => {
    const next = structuredClone(store);
    const result = await fn(next);
    await atomicWrite(STORE_PATH, next);
    store = next;
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

function rateLimit(key, count, windowMs) {
  const time = Date.now();
  let state = limits.get(key);
  if (!state || time > state.until) { state = { count: 0, until: time + windowMs }; limits.set(key, state); }
  if (++state.count > count) fail(429, '요청이 잠시 많습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.');
}

function headers(res, isPrivate = false) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isPrivate) { res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Robots-Tag', 'noindex, nofollow'); }
  else res.setHeader('Cache-Control', 'no-cache');
  if (LOCAL && !PUBLIC_ORIGIN) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}
function json(res, status, value) {
  headers(res, true);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

function expectedOrigin(req) {
  const host = req.headers.host || '';
  if (PUBLIC_ORIGIN) {
    if (host !== new URL(PUBLIC_ORIGIN).host) fail(421, '요청 주소를 확인해 주세요.');
    return PUBLIC_ORIGIN;
  }
  if (![ `127.0.0.1:${PORT}`, `localhost:${PORT}`, `[::1]:${PORT}` ].includes(host)) fail(421, '요청 주소를 확인해 주세요.');
  return `http://${host}`;
}
function checkOrigin(req) {
  const expected = expectedOrigin(req);
  if (req.headers.origin !== expected) fail(403, '이 웹사이트에서 다시 시도해 주세요.');
  if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, '다른 사이트에서 요청할 수 없습니다.');
}

async function body(req) {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) fail(415, 'JSON 요청이 필요합니다.');
  const length = Number(req.headers['content-length'] || 0);
  if (length > MAX_BODY) fail(413, '첨부를 포함한 요청 크기가 너무 큽니다.');
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) fail(413, '첨부를 포함한 요청 크기가 너무 큽니다.');
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, '요청 형식을 확인해 주세요.'); }
  if (!plainObject(value)) fail(400, '요청 형식을 확인해 주세요.');
  return value;
}

function getSession(req) {
  const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('atc_admin='))?.slice(10);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = sessions.get(sha(token));
  if (!session || session.expires < Date.now() || session.touched < Date.now() - 30 * 60_000) { sessions.delete(sha(token)); return null; }
  session.touched = Date.now();
  return { ...session, key: sha(token) };
}
function admin(req, mutate = false) {
  const session = getSession(req);
  if (!session) fail(401, '관리자 로그인이 필요합니다.');
  if (mutate && req.headers['x-csrf-token'] !== session.csrf) fail(403, '페이지를 새로 열고 다시 시도해 주세요.');
  return session;
}

function decodeFile(file, imagesOnly = false) {
  if (!plainObject(file)) fail(422, '첨부파일 형식을 확인해 주세요.');
  const original = textField(file, 'name', 180, true);
  const name = original.replace(/[\\/<>:"|?*\r\n]/g, '_');
  const encoded = file.dataBase64;
  if (typeof encoded !== 'string' || encoded.length > Math.ceil(MAX_FILE / 3) * 4 + 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) fail(422, '첨부파일 데이터를 확인해 주세요.');
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.length > MAX_FILE || bytes.toString('base64') !== encoded) fail(422, '첨부파일은 각각 3MB 이하여야 합니다.');
  let type, ext;
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) { type = 'image/png'; ext = '.png'; }
  else if (bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) { type = 'image/jpeg'; ext = '.jpg'; }
  else if (imagesOnly && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') { type = 'image/webp'; ext = '.webp'; }
  else if (!imagesOnly && bytes.subarray(0, 5).toString() === '%PDF-') { type = 'application/pdf'; ext = '.pdf'; }
  else fail(422, imagesOnly ? 'PNG·JPG·WebP 이미지만 등록할 수 있습니다.' : 'PDF·JPG·PNG 파일만 첨부할 수 있습니다.');
  const allowedExtensions = type === 'image/jpeg' ? ['.jpg', '.jpeg'] : [ext];
  if (file.type !== type || !allowedExtensions.includes(path.extname(name).toLowerCase())) fail(422, '첨부파일의 이름·형식·내용이 일치하지 않습니다.');
  return { id: randomUUID(), name, type, size: bytes.length, ext, bytes, digest: sha(bytes) };
}

function validateInquiry(data) {
  if (data.website) fail(422, '문의 내용을 확인해 주세요.');
  const result = {
    company: textField(data, 'company', 120, true), name: textField(data, 'name', 80, true),
    phone: textField(data, 'phone', 40, true), email: textField(data, 'email', 254, true),
    message: textField(data, 'message', 8000, true), budget: textField(data, 'budget', 120),
    schedule: textField(data, 'schedule', 120), locale: data.locale === 'en' ? 'en' : 'ko'
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) fail(422, '이메일 주소를 확인해 주세요.', { email: '회신 받을 이메일을 입력해 주세요.' });
  if (!/^[+()\d\s.-]{7,40}$/.test(result.phone) || result.phone.replace(/\D/g, '').length < 7) fail(422, '연락처를 확인해 주세요.', { phone: '연락 가능한 전화번호를 입력해 주세요.' });
  if (result.message.length < 10) fail(422, '문의 내용을 10자 이상 적어 주세요.', { message: '10자 이상 입력해 주세요.' });
  if (!Array.isArray(data.services) || !data.services.length || data.services.length > 11 || data.services.some(s => !serviceIds.has(s))) fail(422, '관심 서비스를 선택해 주세요.', { services: '목록에서 한 개 이상 선택해 주세요.' });
  result.services = [...new Set(data.services)].sort();
  if (data.consent !== true) fail(422, '개인정보 수집·이용 동의가 필요합니다.', { consent: '동의 내용을 확인해 주세요.' });
  if (typeof data.submissionKey !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(data.submissionKey)) fail(422, '문의 요청 식별값을 확인해 주세요.');
  if (data.attachments !== undefined && (!Array.isArray(data.attachments) || data.attachments.length > MAX_FILES)) fail(422, '첨부파일은 최대 3개까지 보낼 수 있습니다.');
  result.attachments = (data.attachments || []).map(file => decodeFile(file));
  return result;
}

function projectInput(data, existing = {}) {
  const out = { ...existing };
  for (const [field, max] of Object.entries({ slug: 80, title: 180, titleEn: 180, summary: 600, summaryEn: 600, client: 160, type: 100, year: 4, period: 120, industry: 120, scope: 1500, problem: 10000, strategy: 10000, execution: 10000, result: 10000, publicationNote: 1000 })) out[field] = textField(data, field, max, ['slug','title'].includes(field));
  for (const [field, max] of Object.entries(englishFields)) out[field] = textField(data, field, max);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)) fail(422, '주소는 영문 소문자·숫자·하이픈으로 입력해 주세요.', { slug: '예: brand-renewal' });
  if (out.year && !/^\d{4}$/.test(out.year)) fail(422, '연도를 확인해 주세요.');
  out.services = Array.isArray(data.services) ? [...new Set(data.services)] : [];
  if (out.services.some(s => !serviceIds.has(s) || s === 'other')) fail(422, '사례 수행 분야를 확인해 주세요.');
  out.status = data.status === 'published' ? 'published' : 'draft';
  out.featured = data.featured === true;
  // Existing bilingual cases remain visible; a new Korean batch can be held from EN.
  out.englishPublished = typeof data.englishPublished === 'boolean' ? data.englishPublished : existing.englishPublished !== false;
  out.publicationConfirmed = data.publicationConfirmed === true;
  out.order = Number.isInteger(data.order) ? Math.max(0, Math.min(100000, data.order)) : (existing.order || 0);
  out.videoUrls = Array.isArray(data.videoUrls) ? data.videoUrls.slice(0, 5).filter(Boolean) : [];
  for (const url of out.videoUrls) if (!safeImageURL(url)) fail(422, '영상 링크는 HTTPS 또는 사이트 내부 주소로 입력해 주세요.');
  out.coverImage = textField(data, 'coverImage', 2000);
  if (out.coverImage && !safeImageURL(out.coverImage)) fail(422, '대표 이미지 주소를 확인해 주세요.');
  const imageEdits = Array.isArray(data.images) ? data.images : [];
  out.images = (existing.images || []).map(image => {
    const edit = imageEdits.find(item => item.id === image.id);
    return edit ? { ...image, alt: textField(edit, 'alt', 300), caption: textField(edit, 'caption', 500) } : image;
  });
  if (out.status === 'published') {
    for (const field of ['summary','client','scope','problem','strategy','execution','result']) if (!out[field]) fail(422, '공개하려면 사례 설명을 완성해 주세요.', { [field]: '공개할 사례의 필수 항목입니다.' });
    if (!out.services.length || !out.publicationConfirmed) fail(422, '수행 분야와 공개 가능 여부를 확인해 주세요.');
  }
  out.updatedAt = now();
  return out;
}
function safeImageURL(value) {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.includes('..') && !/[\u0000-\u001f]/.test(value)) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
function publicProject(p) {
  const images = (p.images || []).map(image => ({ id: image.id, url: `/media/projects/${p.id}/${image.id}`, alt: image.alt || '', caption: image.caption || '' }));
  return { id: p.id, slug: p.slug, title: p.title, titleEn: p.titleEn || '', summary: p.summary, summaryEn: p.summaryEn || '', client: p.client, type: p.type, year: p.year, period: p.period || '', industry: p.industry || '', services: p.services || [], scope: p.scope, problem: p.problem, strategy: p.strategy, decision: p.strategy, execution: p.execution, result: p.result, featured: p.featured, englishPublished: p.englishPublished !== false, order: p.order, coverImage: p.coverImage || images[0]?.url || '', cover: p.coverImage || images[0]?.url || '', images, videoUrls: p.videoUrls || [], updatedAt: p.updatedAt, ...Object.fromEntries(Object.keys(englishFields).map(key=>[key,p[key]||''])) };
}

async function seedProjects() {
  const source = JSON.parse(await fs.readFile(process.env.PROJECT_SEED_FILE || path.join(ROOT, 'src/data/content.json'), 'utf8'));
  return (source.projects || []).filter(p => p.slug === 'all-the-comm').map((p, index) => ({
    id: randomUUID(), slug: p.slug, title: p.title, titleEn: p.titleEn || p.en || '', summary: p.summary || '', summaryEn: p.summaryEn || '',
    client: p.client || '올더커뮤니케이션', type: '자사 브랜드 프로젝트', year: p.year || '2026', period: p.period || '', industry: '광고·마케팅',
    services: (p.services || ['strategy','content','it']).filter(s => serviceIds.has(s) && s !== 'other'), scope: p.scope || '', problem: p.problem || '',
    strategy: p.strategy || p.decision || '', execution: p.execution || '', result: p.result || '',
    status: 'published', featured: true, order: index, images: [], videoUrls: (p.videoUrls||[]).filter(safeImageURL), coverImage: safeImageURL(p.coverImage || '') ? p.coverImage : '',
    ...Object.fromEntries(Object.keys(englishFields).map(key=>[key,p[key]||''])),
    publicationConfirmed: true, publicationNote: '자사 리뉴얼이며 외부 고객 실적이 아닙니다.', createdAt: now(), updatedAt: now()
  }));
}

async function initialize() {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('Invalid PORT');
  if (isWithin(DIST, DATA) || isWithin(ADMIN, DATA)) throw new Error('DATA_DIR must be outside publicly served directories');
  if (!LOCAL && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16 || !SECURE)) throw new Error('Public bind requires ADMIN_PASSWORD (16+ characters) and an HTTPS PUBLIC_ORIGIN');
  await fs.mkdir(DATA, { recursive: true, mode: 0o700 });
  await fs.mkdir(path.join(DATA, 'inquiries'), { recursive: true, mode: 0o700 });
  await fs.mkdir(path.join(DATA, 'projects'), { recursive: true, mode: 0o700 });
  try { await fs.writeFile(LOCK_PATH, JSON.stringify({ pid: process.pid, token: lockToken }), { flag: 'wx', mode: 0o600 }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const lock = JSON.parse(await fs.readFile(LOCK_PATH, 'utf8'));
    let alive = true; try { process.kill(lock.pid, 0); } catch (e) { if (e.code === 'ESRCH') alive = false; }
    if (alive) throw new Error('DATA_DIR is already in use. Run one server process per data directory.');
    await fs.unlink(LOCK_PATH);
    await fs.writeFile(LOCK_PATH, JSON.stringify({ pid: process.pid, token: lockToken }), { flag: 'wx', mode: 0o600 });
  }
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (!LOCAL) throw new Error('ADMIN_PASSWORD required');
    const passwordFile = path.join(DATA, 'local-admin-password.txt');
    try { password = (await fs.readFile(passwordFile, 'utf8')).trim(); }
    catch (error) { if (error.code !== 'ENOENT') throw error; password = randomBytes(24).toString('base64url'); await fs.writeFile(passwordFile, password + '\n', { mode: 0o600, flag: 'wx' }); }
    console.log(`Local administrator password file: ${passwordFile}`);
  }
  if (password.length < 16) throw new Error('ADMIN_PASSWORD must contain at least 16 characters');
  passwordHash = scryptSync(password, passwordSalt, 32);
  try { store = JSON.parse(await fs.readFile(STORE_PATH, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Cannot read data store. Restore a verified backup; existing data was not overwritten.'); store = { schema: 1, inquiries: [], projects: await seedProjects() }; await atomicWrite(STORE_PATH, store); }
  if (store.schema !== 1 || !Array.isArray(store.inquiries) || !Array.isArray(store.projects)) throw new Error('Unsupported data store; no data was overwritten');
}

async function serveFile(req, res, base, relative) {
  if (relative.includes('\0') || relative.includes('\\') || relative.split('/').some(s => s.startsWith('.'))) fail(404, '페이지를 찾을 수 없습니다.');
  let target = path.resolve(base, '.' + relative);
  if (!isWithin(base, target)) fail(404, '페이지를 찾을 수 없습니다.');
  try {
    if ((await fs.stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const real = await fs.realpath(target);
    if (!isWithin(await fs.realpath(base), real)) fail(404, '페이지를 찾을 수 없습니다.');
    const bytes = await fs.readFile(real);
    const type = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webm':'video/webm','.mp4':'video/mp4' }[path.extname(real).toLowerCase()] || 'application/octet-stream';
    headers(res, base === ADMIN);
    if (base === ADMIN) res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': bytes.length });
    res.end(req.method === 'HEAD' ? undefined : bytes);
    return true;
  } catch (error) { if (error instanceof ApiError) throw error; if (['ENOENT','ENOTDIR'].includes(error.code)) return false; throw error; }
}

async function serveProject(req, res, project, en) {
  let html;
  try { html = await fs.readFile(path.join(DIST, en ? 'en/works/project/index.html' : 'works/project/index.html'), 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const translated = key => en && project[key+'En'] ? project[key+'En'] : project[key] || '';
  const prefix = en ? '/en' : '';
  const origin = PUBLIC_ORIGIN || 'https://allthecom.co.kr';
  const canonical = origin + prefix + '/works/project/' + project.slug + '/';
  const title = translated('title') + ' — ALL THE COMMUNICATION';
  const description = translated('summary');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>'+escape(title)+'</title>');
  html = html.replace(/(<meta\b[^>]*\b(?:name|property)="(?:description|og:description)"[^>]*\bcontent=")[^"]*(")/g, (_,a,b)=>a+escape(description)+b);
  html = html.replace(/(<meta\b[^>]*\bproperty="og:title"[^>]*\bcontent=")[^"]*(")/g, (_,a,b)=>a+escape(title)+b);
  html = html.replace(/(<meta\b[^>]*\bproperty="og:url"[^>]*\bcontent=")[^"]*(")/g, (_,a,b)=>a+escape(canonical)+b);
  html = html.replace(/(<link\b[^>]*\brel="canonical"[^>]*\bhref=")[^"]*(")/g, (_,a,b)=>a+escape(canonical)+b);
  html = html.replace(/<link\b[^>]*\brel="alternate"[^>]*>/g, tag => {
    const language = tag.match(/hreflang="([^"]+)"/)?.[1];
    if (language === 'en' && project.englishPublished === false) return '';
    const url = origin + (language === 'en' ? '/en' : '') + '/works/project/' + project.slug + '/';
    return tag.replace(/href="[^"]*"/,'href="'+escape(url)+'"');
  });
  html = html.replace(/(<a\b[^>]*\bdata-lang\b[^>]*\bhref=")[^"]*(")/g, (_,a,b)=>a+escape(project.englishPublished===false?'/en/works/':(en?'':'/en')+'/works/project/'+project.slug+'/')+b);
  for (const key of ['title','summary','client','scope','year','problem','strategy','execution','result']) {
    // The authored English self-case is a safe fallback for its own original content only.
    if (en && project.slug === 'all-the-comm' && !project[key+'En'] && key !== 'year') continue;
    const value = translated(key);
    const regex = new RegExp('(<(h1|p|dd)\\b[^>]*\\bdata-case-'+key+'[^>]*>)[\\s\\S]*?(<\\/\\2>)','g');
    html = html.replace(regex, (_,opening,tag,closing)=>opening.replace(/>$/,en&&!project[key+'En']&&/[가-힣]/.test(value)?' lang="ko">':'>')+escape(value)+closing);
  }
  const type = [translated('type'),project.year].filter(Boolean).join(' · ');
  if (!(en && project.slug === 'all-the-comm' && !project.typeEn)) html = html.replace(/(<p\b[^>]*\bdata-case-type[^>]*>)[\s\S]*?(<\/p>)/g, (_,a,b)=>a+escape(type)+b);
  const publicData = publicProject(project);
  const cover = publicData.coverImage;
  if (cover) html = html.replace(/(<meta\b[^>]*\bproperty="og:image"[^>]*\bcontent=")[^"]*(")/g, (_,a,b)=>a+escape(new URL(cover,origin).href)+b);
  if (project.slug !== 'all-the-comm') {
    if (!en) html=html.replace(/(<body\b[^>]*class=")([^"]*)"/,(_,opening,classes)=>opening+classes+' capture-case"');
    if (project.type?.startsWith('제작자')) html=html.replace('<dt>CLIENT</dt>','<dt>PROJECT</dt>');
    let index=0;
    const headings=en?['The challenge','The strategy','The execution']:['프로젝트의 과제','실행의 방향','만들고 실행한 일'];
    html=html.replace(/(<div class="case-story">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/g,(_,a,b)=>a+escape(headings[index++]||headings[2])+b);
    html=html.replace(/(<div class="case-cover shell" data-case-cover>)[\s\S]*?(<\/div><section class="case-body\b)/,(_,a,b)=>a+(cover?'<img src="'+escape(cover)+'" alt="'+escape(translated('title'))+'">':'')+b);
    html=html.replace(/(<div class="case-film">)[\s\S]*?(<\/div>)/,(_,a,b)=>a+(project.videoUrls||[]).map(url=>'<a class="text-link" href="'+escape(url)+'" target="_blank" rel="noopener">'+(en?'Watch project video':'프로젝트 영상 보기')+'</a>').join('')+b);
  }
  html=html.replace(/(href="[^"?]*contact\/\?project=)[^"&]*(")/g,(_,a,b)=>a+escape(project.slug)+b);
  html=html.replace(/(<script type="application\/json" id="site-data">)([\s\S]*?)(<\/script>)/,(_,a,raw,b)=>{
    const data=JSON.parse(raw);data.project=publicData;
    return a+JSON.stringify(data).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026')+b;
  });
  headers(res);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':Buffer.byteLength(html)});res.end(req.method==='HEAD'?undefined:html);return true;
}

async function route(req, res) {
  expectedOrigin(req);
  const url = new URL(req.url, 'http://server.local');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname).replace(/\/{2,}/g, '/'); } catch { fail(400, '주소를 확인해 주세요.'); }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.includes(':') || pathname.split('/').some(s => s === '..' || /[. ]$/.test(s))) fail(404, '페이지를 찾을 수 없습니다.');
  const ip = req.socket.remoteAddress || 'unknown';
  if (!['GET','HEAD','POST','PUT','PATCH','DELETE'].includes(req.method)) fail(405, '허용하지 않는 요청입니다.');
  if (!['GET','HEAD'].includes(req.method)) checkOrigin(req);

  if (pathname === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true, inquiryDelivery: 'administrator-inbox', emailConfigured: false });
  if (pathname === '/api/services' && req.method === 'GET') return json(res, 200, { services, attachmentLimits: { count: MAX_FILES, bytesPerFile: MAX_FILE, types: ['application/pdf','image/jpeg','image/png'] } });
  if (pathname === '/api/projects' && req.method === 'GET') return json(res, 200, { projects: store.projects.filter(p => p.status === 'published' && (url.searchParams.get('lang') !== 'en' || p.englishPublished !== false)).sort((a,b) => a.order - b.order).map(publicProject) });
  const publicDetail = pathname.match(/^\/api\/projects\/([a-z0-9-]+)$/);
  if (publicDetail && req.method === 'GET') {
    const project = store.projects.find(p => p.slug === publicDetail[1] && p.status === 'published' && (url.searchParams.get('lang') !== 'en' || p.englishPublished !== false));
    if (!project) fail(404, '프로젝트를 찾을 수 없습니다.');
    return json(res, 200, { project: publicProject(project) });
  }

  if (pathname === '/api/inquiries' && req.method === 'POST') {
    rateLimit('inquiry-attempt:' + ip, 20, 15 * 60_000);
    const data = await body(req);
    const inquiry = validateInquiry(data);
    const fingerprint = sha(JSON.stringify({ ...inquiry, attachments: inquiry.attachments.map(a => ({ name:a.name, digest:a.digest })) }));
    const receipt = await transaction(async next => {
      const previous = next.inquiries.find(i => i.submissionKey === data.submissionKey);
      if (previous) {
        if (previous.fingerprint !== fingerprint) fail(409, '같은 요청 번호로 다른 내용을 보낼 수 없습니다. 새 문의로 다시 시도해 주세요.');
        return { id:previous.id, receivedAt:previous.receivedAt, duplicate:true };
      }
      const duplicate = next.inquiries.find(i => i.fingerprint === fingerprint && Date.parse(i.receivedAt) > Date.now() - 10 * 60_000);
      if (duplicate) return { id:duplicate.id, receivedAt:duplicate.receivedAt, duplicate:true };
      rateLimit('inquiry-new:' + ip, 5, 15 * 60_000);
      const id = 'INQ-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + randomBytes(6).toString('hex');
      const dir = path.join(DATA, 'inquiries', id);
      await fs.mkdir(dir, { mode: 0o700 });
      for (const file of inquiry.attachments) {
        const handle = await fs.open(path.join(dir, file.id + file.ext), 'wx', 0o600);
        try { await handle.writeFile(file.bytes); await handle.sync(); } finally { await handle.close(); }
      }
      const attachments = inquiry.attachments.map(({ bytes, ...file }) => file);
      const receivedAt = now();
      next.inquiries.push({ ...inquiry, id, attachments, receivedAt, updatedAt:receivedAt, status:'new', consent:true, consentVersion:'2026-10-12', submissionKey:data.submissionKey, fingerprint, delivery:'administrator-inbox', emailStatus:'not-configured' });
      return { id, receivedAt, duplicate:false };
    });
    return json(res, receipt.duplicate ? 200 : 201, { ok:true, ...receipt, delivery:'administrator-inbox' });
  }

  if (pathname === '/api/admin/login' && req.method === 'POST') {
    rateLimit('login:' + ip, 8, 15 * 60_000);
    const data = await body(req);
    const candidate = typeof data.password === 'string' && data.password.length <= 1024 ? data.password : '';
    const hash = scryptSync(candidate, passwordSalt, 32);
    if (!timingSafeEqual(hash, passwordHash)) fail(401, '비밀번호를 확인해 주세요.');
    const token = randomBytes(32).toString('hex'); const csrf = randomBytes(32).toString('hex');
    sessions.set(sha(token), { csrf, expires:Date.now()+8*60*60_000, touched:Date.now() });
    res.setHeader('Set-Cookie', `atc_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${SECURE ? '; Secure' : ''}`);
    return json(res, 200, { ok:true, csrf });
  }
  if (pathname.startsWith('/api/admin/')) {
    const session = admin(req, !['GET','HEAD'].includes(req.method));
    if (pathname === '/api/admin/session' && req.method === 'GET') return json(res, 200, { ok:true, csrf:session.csrf, delivery:'administrator-inbox', emailConfigured:false });
    if (pathname === '/api/admin/logout' && req.method === 'POST') { sessions.delete(session.key); res.setHeader('Set-Cookie', `atc_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${SECURE ? '; Secure' : ''}`); return json(res, 200, { ok:true }); }
    if (pathname === '/api/admin/inquiries' && req.method === 'GET') return json(res, 200, { inquiries:store.inquiries.slice().reverse().map(({ id,company,name,email,phone,services,message,receivedAt,status,locale,attachments }) => ({ id,company,name,email,phone,services,preview:message.slice(0,150),receivedAt,status,locale,attachmentCount:attachments.length })) });
    const inquiryRoute = pathname.match(/^\/api\/admin\/inquiries\/(INQ-[a-zA-Z0-9-]+)$/);
    if (inquiryRoute) {
      const item = store.inquiries.find(i => i.id === inquiryRoute[1]);
      if (!item) fail(404, '문의를 찾을 수 없습니다.');
      if (req.method === 'GET') { const { fingerprint,submissionKey,...safe } = item; return json(res, 200, { inquiry:safe }); }
      if (req.method === 'PATCH') {
        const data = await body(req);
        if (!['new','in-progress','closed'].includes(data.status)) fail(422, '처리 상태를 확인해 주세요.');
        await transaction(next => { const i = next.inquiries.find(i => i.id === item.id); i.status = data.status; i.updatedAt = now(); });
        return json(res, 200, { ok:true });
      }
    }
    const attachmentRoute = pathname.match(/^\/api\/admin\/inquiries\/(INQ-[a-zA-Z0-9-]+)\/attachments\/([a-f0-9-]{36})$/);
    if (attachmentRoute && req.method === 'GET') {
      const inquiry = store.inquiries.find(i => i.id === attachmentRoute[1]);
      const file = inquiry?.attachments.find(a => a.id === attachmentRoute[2]);
      if (!file) fail(404, '첨부파일을 찾을 수 없습니다.');
      const bytes = await fs.readFile(path.join(DATA,'inquiries',inquiry.id,file.id+file.ext));
      headers(res, true); res.writeHead(200, { 'Content-Type':'application/octet-stream', 'Content-Disposition':`attachment; filename="attachment${file.ext}"; filename*=UTF-8''${encodeURIComponent(file.name)}`, 'Content-Security-Policy':"sandbox; default-src 'none'", 'Content-Length':bytes.length }); return res.end(bytes);
    }
    if (pathname === '/api/admin/projects' && req.method === 'GET') return json(res, 200, { projects:store.projects.slice().sort((a,b)=>a.order-b.order).map(p=>({ ...p, ...publicProject(p), status:p.status, publicationConfirmed:p.publicationConfirmed, publicationNote:p.publicationNote })) });
    if (pathname === '/api/admin/projects' && req.method === 'POST') {
      const input = projectInput(await body(req));
      const project = await transaction(next => {
        if (next.projects.some(p=>p.slug===input.slug)) fail(409,'이미 사용 중인 프로젝트 주소입니다.');
        const project = { ...input, id:randomUUID(), createdAt:now(), order:next.projects.length, images:[] };
        next.projects.push(project); return project;
      });
      return json(res, 201, { project });
    }
    if (pathname === '/api/admin/projects/reorder' && req.method === 'POST') {
      const { ids } = await body(req);
      if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.length !== store.projects.length || ids.some(id=>!store.projects.some(p=>p.id===id))) fail(422,'모든 사례를 한 번씩 포함해야 합니다.');
      await transaction(next => { ids.forEach((id,index)=>{next.projects.find(p=>p.id===id).order=index;}); });
      return json(res, 200, { ok:true });
    }
    const projectRoute = pathname.match(/^\/api\/admin\/projects\/([a-f0-9-]{36})$/);
    if (projectRoute) {
      const project = store.projects.find(p=>p.id===projectRoute[1]);
      if (!project) fail(404,'사례를 찾을 수 없습니다.');
      if (req.method === 'GET') return json(res,200,{project:{...project,...publicProject(project)}});
      if (req.method === 'PUT') {
        const data = await body(req);
        const result = await transaction(next=>{
          const current = next.projects.find(p=>p.id===project.id);
          const updated = projectInput(data,current);
          if(next.projects.some(p=>p.id!==project.id&&p.slug===updated.slug)) fail(409,'이미 사용 중인 프로젝트 주소입니다.');
          next.projects[next.projects.findIndex(p=>p.id===project.id)]=updated; return updated;
        });
        return json(res,200,{project:result});
      }
      if (req.method === 'DELETE') { await transaction(next=>{next.projects=next.projects.filter(p=>p.id!==project.id);}); return json(res,200,{ok:true}); }
    }
    const uploadRoute = pathname.match(/^\/api\/admin\/projects\/([a-f0-9-]{36})\/media$/);
    if (uploadRoute && req.method === 'POST') {
      const data = await body(req); const file = decodeFile(data,true);
      const result = await transaction(async next=>{
        const project = next.projects.find(p=>p.id===uploadRoute[1]);
        if(!project) fail(404,'사례를 찾을 수 없습니다.');
        if(project.images.length>=20) fail(422,'사례별 이미지는 최대 20개입니다.');
        const dir=path.join(DATA,'projects',project.id); await fs.mkdir(dir,{recursive:true,mode:0o700});
        const handle=await fs.open(path.join(dir,file.id+file.ext),'wx',0o600);try{await handle.writeFile(file.bytes);await handle.sync();}finally{await handle.close();}
        const {bytes,...image}=file; image.alt=textField(data,'alt',300); image.caption=textField(data,'caption',500);
        project.images.push(image);project.updatedAt=now(); return {id:image.id,url:`/media/projects/${project.id}/${image.id}`,alt:image.alt,caption:image.caption};
      });
      return json(res,201,{image:result});
    }
    fail(404,'관리 요청을 찾을 수 없습니다.');
  }
  const mediaRoute = pathname.match(/^\/media\/projects\/([a-f0-9-]{36})\/([a-f0-9-]{36})$/);
  if (mediaRoute && ['GET','HEAD'].includes(req.method)) {
    const project = store.projects.find(p=>p.id===mediaRoute[1]);
    if(!project || (project.status!=='published'&&!getSession(req))) fail(404,'이미지를 찾을 수 없습니다.');
    const image=project.images.find(i=>i.id===mediaRoute[2]); if(!image) fail(404,'이미지를 찾을 수 없습니다.');
    const bytes=await fs.readFile(path.join(DATA,'projects',project.id,image.id+image.ext));
    headers(res,project.status!=='published');res.writeHead(200,{'Content-Type':image.type,'Content-Length':bytes.length});return res.end(req.method==='HEAD'?undefined:bytes);
  }
  if (pathname.startsWith('/api/')) fail(404,'요청을 찾을 수 없습니다.');
  if (!['GET','HEAD'].includes(req.method)) fail(405,'허용하지 않는 요청입니다.');
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const relative=pathname==='/admin'?'/':pathname.slice('/admin'.length);
    if(await serveFile(req,res,ADMIN,relative)) return;
    fail(404,'관리 화면을 찾을 수 없습니다.');
  }
  if (pathname === '/sitemap.xml') {
    const origin=PUBLIC_ORIGIN || 'https://allthecom.co.kr';
    const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
    const paths=['/','/about/','/process/','/team/','/works/','/contact/','/privacy/'];
    const all=[...paths,...paths.map(p=>'/en'+p),...store.projects.filter(p=>p.status==='published').flatMap(p=>[`/works/project/${p.slug}/`,...(p.englishPublished===false?[]:[`/en/works/project/${p.slug}/`])])];
    headers(res);res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8'});return res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${all.map(p=>`<url><loc>${escape(origin+p)}</loc></url>`).join('')}</urlset>`);
  }
  const dynamicCase=pathname.match(/^(\/en)?\/works\/project\/([a-z0-9-]+)(?:\/index\.html|\/)?$/i);
  if(dynamicCase){
    const project=store.projects.find(p=>p.slug===dynamicCase[2].toLowerCase()&&p.status==='published');
    if(!project || (dynamicCase[1] && project.englishPublished === false)) return notFound(req,res);
    // Use the common shell first so unpublished and edited cases are never a stale static page.
    if(await serveProject(req,res,project,Boolean(dynamicCase[1]))) return;
  }
  // This namespace is data-driven; its static template or old output must never bypass publication checks.
  if(/^\/(?:en\/)?works\/project(?:\/|$)/i.test(pathname)) return notFound(req,res);
  if(await serveFile(req,res,DIST,pathname)) return;
  return notFound(req,res);
}
async function notFound(req,res){headers(res);res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');let page;try{page=await fs.readFile(path.join(DIST,'404.html'));}catch{page=Buffer.from('<h1>페이지를 찾을 수 없습니다.</h1>');}res.end(req.method==='HEAD'?undefined:page);}

async function shutdown() {
  if(server) await new Promise(resolve=>server.close(resolve));
  await queue;
  try{const lock=JSON.parse(await fs.readFile(LOCK_PATH,'utf8'));if(lock.token===lockToken)await fs.unlink(LOCK_PATH);}catch{}
}
try {
  await initialize();
  server=http.createServer((req,res)=>route(req,res).catch(error=>{
    if(res.headersSent){res.destroy();return;}
    const status=error instanceof ApiError?error.status:500;
    if(status===500)console.error('Server request failed:',error.code||error.name);
    json(res,status,{ok:false,error:status===500?'처리 중 문제가 발생했습니다. 입력 내용을 유지하고 다시 시도해 주세요.':error.message,fields:error.fields||{}});
  }));
  server.requestTimeout=30_000;server.headersTimeout=15_000;
  server.listen(PORT,HOST,()=>console.log(`ALL THE COMM server: ${PUBLIC_ORIGIN||`http://${HOST}:${PORT}`} · admin /admin/ · durable inbox enabled · email not configured`));
  server.on('error',async error=>{console.error('Server startup failed:',error.code||error.message);await shutdown();process.exitCode=1;});
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>shutdown().then(()=>process.exit(0)));
  setInterval(()=>{const time=Date.now();for(const[k,v]of limits)if(v.until<time)limits.delete(k);for(const[k,v]of sessions)if(v.expires<time||v.touched<time-30*60_000)sessions.delete(k);},60_000).unref();
} catch(error) {console.error('Server startup failed:',error.message);await shutdown();process.exitCode=1;}
