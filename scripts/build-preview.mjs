// 서버 없이 열어 보는 사이트 미리보기 한 파일을 만듭니다.
// 실행 중인 로컬 서버(사례 데이터 등록 완료)에서 모든 페이지를 받아 이미지·글꼴·스크립트·사례 데이터와 함께
// 하나의 HTML에 묶습니다. 메뉴·링크는 파일 안에서 페이지를 바꾸고, 문의서는 실제로 전송하지 않습니다.
//   PREVIEW_URL=http://127.0.0.1:4183 node scripts/build-preview.mjs [출력 경로]
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const origin = (process.env.PREVIEW_URL || 'http://127.0.0.1:4183').replace(/\/$/, '');
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) throw Error('Preview packing only reads a local server.');
const out = path.resolve(process.argv[2] || path.join(root, 'dist-preview/site-preview.html'));
const get = async (url, type = 'text') => { const r = await fetch(origin + url); if (!r.ok) throw Error(`${r.status} ${url}`); return type === 'json' ? r.json() : r.text(); };

// 1) routes ---------------------------------------------------------------------------
const ko = (await get('/api/projects', 'json')).projects;
const en = (await get('/api/projects?lang=en', 'json')).projects;
const main = ['/', '/about/', '/process/', '/team/', '/works/', '/contact/', '/privacy/'];
const routes = [
  ...main.map(r => ({ path: r, group: '국문 메뉴' })),
  ...ko.map(p => ({ path: `/works/project/${p.slug}/`, group: '국문 사례', label: p.title })),
  { path: '/404.html', group: '국문 메뉴', label: '404' },
  { path: '/en/404.html', group: 'English', label: 'EN · 404' },
  ...main.map(r => ({ path: '/en' + r, group: 'English' })),
  ...en.map(p => ({ path: `/en/works/project/${p.slug}/`, group: 'English', label: p.titleEn || p.title }))
];
const pages = {};
for (const r of routes) pages[r.path] = await get(r.path);
const api = { '/api/projects': { projects: ko }, '/api/projects?lang=en': { projects: en } };
for (const p of ko) api[`/api/projects/${p.slug}`] = await get(`/api/projects/${p.slug}`, 'json');
for (const p of en) api[`/api/projects/${p.slug}?lang=en`] = await get(`/api/projects/${p.slug}?lang=en`, 'json');

// 2) one script bundle; URL-dependent code reads the preview route instead of the frame address
const patch = {
  name: 'preview-location', setup(b) {
    b.onLoad({ filter: /[\\/]src[\\/].*\.m?js$/ }, async args => {
      let code = await fs.readFile(args.path, 'utf8');
      code = code.replace("return ['http:','https:'].includes(u.protocol)?u.href:'';", "return ['http:','https:','blob:'].includes(u.protocol)?__P.asset(u.href):'';")
        .replace(/\blocation\.(origin|pathname|search|hash)\b/g, (_, k) => '__P.' + ({ pathname: 'path' }[k] || k));
      return { contents: code, loader: 'js' };
    });
  }
};
const js = (await build({ entryPoints: [path.join(root, 'src/app.js')], bundle: true, minify: true, format: 'esm', write: false, target: 'es2022', plugins: [patch], logLevel: 'warning' })).outputFiles[0].text;

// 3) assets: everything the pages, styles, script and project data refer to ------------
const css = {};
for (const html of Object.values(pages)) for (const [, href] of html.matchAll(/<link rel="stylesheet" href="(\/[^"]+\.css)"/g)) css[href] ??= await fs.readFile(path.join(dist, href), 'utf8');
const assetRe = /\/(?:brand|showcase|portfolio|evidence|fonts|motion|chunks)\/[^"'()\s,\\<>]+|\/(?:og\.png|favicon\.svg)/g;
const texts = [...Object.values(pages), ...Object.values(css), js, JSON.stringify(api)];
const wanted = new Set(texts.flatMap(t => t.match(assetRe) || []).map(u => decodeURI(u.split(/[?#]/)[0])));
const assets = {}, skipped = [];
const mime = { '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json' };
let python = true;
for (const u of wanted) {
  const file = path.join(dist, u);
  const ext = path.extname(u).toLowerCase();
  let buf;
  try { buf = await fs.readFile(file); } catch { skipped.push(u + ' (missing)'); continue; }
  if (ext === '.mp4') { skipped.push(u + ' (video, poster shown)'); continue; }
  let type = mime[ext] || 'application/octet-stream';
  // heavy rasters are re-encoded for the preview only (max 1600px, WebP q78)
  if (['.png', '.jpg', '.jpeg'].includes(ext) && buf.length > 280_000 && python) {
    try {
      buf = execFileSync('python3', ['-I', '-c', 'import sys,io\nfrom PIL import Image\nim=Image.open(sys.argv[1]);im=im.convert("RGBA" if im.mode in ("RGBA","LA","P") else "RGB");im.thumbnail((1600,1600));b=io.BytesIO();im.save(b,"WEBP",quality=78,method=5);sys.stdout.buffer.write(b.getvalue())', file], { maxBuffer: 64 << 20 });
      type = 'image/webp';
    } catch { python = false; }
  }
  assets[u] = { type, data: buf.toString('base64') };
}

// 4) tokenise: every asset path becomes asset:/path, swapped for a blob URL in the browser
const tok = t => t.replace(assetRe, m => assets[decodeURI(m.split(/[?#]/)[0])] ? 'asset:' + m : m);
const pageData = Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, tok(v)]));
const cssData = Object.fromEntries(Object.entries(css).map(([k, v]) => [k, tok(v)]));
const bundle = {
  routes, pages: pageData, css: cssData, js: tok(js), api: JSON.parse(tok(JSON.stringify(api))), assets,
  builtAt: new Date().toISOString(), skipped
};
const shell = await fs.readFile(path.join(root, 'scripts/preview-shell.html'), 'utf8');
const payload = JSON.stringify(bundle).replace(/</g, '\\u003c');
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, shell.replace('/*__PREVIEW_DATA__*/null', () => payload));
const size = (await fs.stat(out)).size;
console.log(`Preview: ${out}\n  ${routes.length} pages · ${Object.keys(assets).length} assets · ${(size / 1048576).toFixed(1)} MB`);
if (skipped.length) console.log('  skipped: ' + skipped.join(', '));
