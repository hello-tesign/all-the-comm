const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
let pw; try { pw = require('playwright'); } catch { pw = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'full-flow');
const PORT = Number(process.env.FULL_FLOW_PORT || 4184);
const BASE = `http://127.0.0.1:${PORT}`;
const ID = randomUUID();
const DATA = path.join(ROOT, '.private', 'full-flow-' + ID);
const PASSWORD = 'isolated-e2e-' + randomUUID();
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XcAAAAASUVORK5CYII=', 'base64');
const results = [], pageErrors = [], externalRequests = [];
let child, browser, adminPage, visitorPage, childLog = '';
function check(name, condition, detail = '') { assert.ok(condition, name + (detail ? ': ' + detail : '')); results.push({ name, passed: true, detail }); }
async function stop() {
  await browser?.close();
  if (child && child.exitCode === null) await new Promise(resolve => { child.once('exit', resolve); child.kill('SIGTERM'); });
}
async function start() {
  child = spawn(process.execPath, ['scripts/server.mjs'], { cwd: ROOT, env: { ...process.env, HOST: '127.0.0.1', PORT: String(PORT), DATA_DIR: DATA, ADMIN_PASSWORD: PASSWORD, PUBLIC_ORIGIN: '' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', d => childLog += d); child.stderr.on('data', d => childLog += d);
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw Error('Isolated server stopped: ' + childLog);
    try { if ((await fetch(BASE + '/api/health')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Isolated server becomes ready');
}
async function fillContact(page, language) {
  const form = page.locator('#inquiry-form');
  await form.locator('[name=services][value=it]').check();
  await form.locator('[name=services][value=pr]').check();
  await form.locator('[name=company]').fill(language === 'en' ? 'Isolated English E2E' : '통합 검수 전용 회사');
  await form.locator('[name=name]').fill('Synthetic QA');
  await form.locator('[name=phone]').fill('010-0000-0000');
  await form.locator('[name=email]').fill('full-flow@example.invalid');
  await form.locator('[name=message]').fill(language === 'en' ? 'A local full-flow test. This must never be sent to an external email service.' : '실제 공개 접수함과 구분되는 격리 서버의 통합 검수용 문의입니다. 외부 이메일 발송은 하지 않습니다.');
  await form.locator('[name=budget]').fill('검수 자료');
  await form.locator('[name=schedule]').fill('미정');
  await form.locator('[name=attachments]').setInputFiles({ name: 'full-flow-proof.png', mimeType: 'image/png', buffer: PNG });
  await form.locator('[name=consent]').check();
  return form;
}
async function submitContact(page) {
  const responsePromise = page.waitForResponse(r => r.url() === BASE + '/api/inquiries' && r.request().method() === 'POST');
  await page.locator('#inquiry-form [type=submit]').click();
  const response = await responsePromise;
  const receipt = await response.json();
  assert.equal(response.status(), 201);
  await page.locator('#form-status[data-state=success]').waitFor();
  return receipt;
}

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  await start();
  check('test uses a fresh isolated store and never the production inbox', DATA !== path.join(ROOT, '.private', 'server') && DATA.includes('full-flow-'));
  browser = await pw.chromium.launch({ headless: true });
  const visitor = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  const operator = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  for (const context of [visitor, operator]) context.on('page', page => {
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(BASE) && /^https?:/.test(request.url())) externalRequests.push(request.url()); });
  });
  visitorPage = await visitor.newPage(); adminPage = await operator.newPage();
  await visitorPage.goto(BASE + '/contact/?service=it');
  await visitorPage.locator('#inquiry-form [name=services][value=it]').waitFor();
  check('contact service query preselects the requested service', await visitorPage.locator('#inquiry-form [name=services][value=it]').isChecked());
  check('privacy consent is initially unchecked', !await visitorPage.locator('#inquiry-form [name=consent]').isChecked());
  const form = await fillContact(visitorPage, 'ko');

  // The failure is deliberately injected once. The following submission is sent to the real server.
  await visitorPage.route('**/api/inquiries', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Synthetic temporary failure' }) }), { times: 1 });
  await form.locator('[type=submit]').click();
  await visitorPage.locator('#form-status[data-state=error]').waitFor();
  check('temporary submission failure preserves entered company and attachment', await form.locator('[name=company]').inputValue() === '통합 검수 전용 회사' && await form.locator('[name=attachments]').evaluate(input => input.files.length) === 1);
  const receipt = await submitContact(visitorPage);
  check('real contact submission returns a durable receipt and visible success', receipt.ok === true && receipt.id.startsWith('INQ-') && (await visitorPage.locator('#form-status').innerText()).includes(receipt.id));
  check('successful submission resets the form after receipt', await form.locator('[name=company]').inputValue() === '' && !await form.locator('[name=consent]').isChecked());
  await visitorPage.screenshot({ path: path.join(OUT, '01-contact-received.png'), fullPage: true });

  await adminPage.goto(BASE + '/admin/');
  await adminPage.getByLabel('관리자 비밀번호').fill(PASSWORD);
  await adminPage.getByRole('button', { name: '로그인', exact: true }).click();
  await adminPage.getByRole('heading', { name: '회사 운영', exact: true }).waitFor();
  const inquiryRow = adminPage.locator('#inquiry-list .list-item').filter({ hasText: '통합 검수 전용 회사' });
  await inquiryRow.getByRole('button', { name: '상세 확인', exact: true }).click();
  await adminPage.locator('#inquiry-detail').waitFor({ state: 'visible' });
  const inquiryDetail = await adminPage.locator('#inquiry-detail').innerText();
  check('administrator reads the exact frontend receipt services and message', inquiryDetail.includes(receipt.id) && inquiryDetail.includes('IT 솔루션 지원') && inquiryDetail.includes('언론홍보') && inquiryDetail.includes('외부 이메일 발송은 하지 않습니다'));
  const downloadLink = adminPage.locator('#inquiry-detail a').filter({ hasText: 'full-flow-proof.png' });
  const attachmentURL = await downloadLink.getAttribute('href');
  const forbiddenDownload = await visitor.request.get(BASE + attachmentURL);
  check('a separate anonymous browser cannot download the inquiry attachment', forbiddenDownload.status() === 401);
  const downloadPromise = adminPage.waitForEvent('download');
  await downloadLink.click();
  const download = await downloadPromise;
  const downloadedBytes = await fs.readFile(await download.path());
  check('administrator download contains exactly the attached file', download.suggestedFilename() === 'full-flow-proof.png' && downloadedBytes.equals(PNG));
  await adminPage.screenshot({ path: path.join(OUT, '02-admin-receipt.png'), fullPage: true });

  await visitorPage.goto(BASE + '/en/contact/');
  await fillContact(visitorPage, 'en');
  const englishReceipt = await submitContact(visitorPage);
  check('English contact uses an English completion message', (await visitorPage.locator('#form-status').innerText()).includes('Your enquiry has been received'));
  const persisted = JSON.parse(await fs.readFile(path.join(DATA, 'store.json'), 'utf8'));
  const persistedEnglish = persisted.inquiries.find(i => i.id === englishReceipt.id);
  check('English frontend locale and receipt are stored with exact attachment bytes', persistedEnglish?.locale === 'en' && persistedEnglish.attachments[0].size === PNG.length);

  await adminPage.getByRole('button', { name: '프로젝트', exact: true }).click();
  await adminPage.getByRole('button', { name: '새 사례 등록', exact: true }).click();
  const editor = adminPage.locator('#project-form');
  const slug = 'e2e-local-' + ID.slice(0, 8);
  const title = '격리 검수용 프로젝트';
  for (const [key,value] of Object.entries({ title, slug, titleEn:'Isolated end-to-end project', client:'LOCAL QA ONLY & <review>', type:'격리 검수용', industry:'로컬 검수', year:'2026', period:'2026.10', summary:'운영 사이트에 등록되지 않는 격리 검수용 사례입니다.', summaryEn:'A test case stored only in an isolated local server.', scope:'관리자와 공개 화면의 실제 연결 확인', problem:'저장한 사례가 방문자 화면에 올바르게 전달되어야 합니다.', strategy:'공개 상태·수행 분야·이미지를 연결하여 확인합니다.', execution:'관리자에서 사례를 저장하고 공개합니다.', result:'실제 회사 실적이 아닌 자동 검수용 데이터입니다.', publicationNote:'격리 테스트 서버 전용 합성 자료' })) await editor.locator(`[name=${key}]`).fill(value);
  await editor.locator('.translation-fields summary').click();
  for (const [key,value] of Object.entries({clientEn:'PRIVATE QA CLIENT',typeEn:'Isolated test case',industryEn:'Local testing',scopeEn:'Verify the connection between the editor and the public website.',problemEn:'The authored project must reach visitors accurately.',strategyEn:'Connect publication, services and media in a real flow.',executionEn:'Save and publish the project from the administrator interface.',resultEn:'Synthetic evidence only. No external client claim.'})) await editor.locator(`[name=${key}]`).fill(value);
  await editor.locator('[name=services][value=it]').check(); await editor.locator('[name=services][value=pr]').check();
  await editor.locator('[name=featured]').check();
  let savePromise = adminPage.waitForResponse(r => r.url() === BASE + '/api/admin/projects' && r.request().method() === 'POST');
  await editor.getByRole('button', { name: '저장하기', exact: true }).click();
  const createResponse = await savePromise; const created = (await createResponse.json()).project;
  check('administrator creates a private project through the actual editor', createResponse.status() === 201 && created.status === 'draft');
  await adminPage.locator('#upload-image:not([disabled])').waitFor();
  await adminPage.locator('#image-upload').setInputFiles({ name:'project-proof.png', mimeType:'image/png', buffer:PNG });
  await adminPage.getByRole('button', { name:'선택한 이미지 등록', exact:true }).click();
  await adminPage.locator('.media-item img').waitFor();
  await adminPage.locator('[data-alt]').fill('통합 검수용 이미지'); await adminPage.locator('[data-caption]').fill('관리자에서 입력한 캡션');
  await editor.locator('[name=publicationConfirmed]').check(); await editor.locator('[name=status]').selectOption('published');
  savePromise = adminPage.waitForResponse(r => r.url() === BASE + '/api/admin/projects/' + created.id && r.request().method() === 'PUT');
  await editor.getByRole('button', { name:'저장하기', exact:true }).click(); await savePromise; await adminPage.locator('#project-preview').waitFor({ state:'visible' });
  check('publishing from administrator editor exposes the public detail link', (await adminPage.locator('#project-preview').getAttribute('href')).endsWith('/' + slug + '/'));
  check('full English fields remain populated after the editor reloads saved data',await editor.locator('[name=problemEn]').inputValue()==='The authored project must reach visitors accurately.'&&await editor.locator('[name=resultEn]').inputValue()==='Synthetic evidence only. No external client claim.');

  const rawKR=await visitor.request.get(BASE+'/works/project/'+slug+'/');const rawHTML=await rawKR.text();
  check('server-rendered raw HTML identifies the actual project before JavaScript',rawKR.status()===200&&rawHTML.includes('<h1 data-case-title>'+title+'</h1>')&&rawHTML.includes('<title>'+title+' — ALL THE COMMUNICATION</title>'));
  check('server-rendered project description canonical and hreflang match the new slug',rawHTML.includes('content="운영 사이트에 등록되지 않는 격리 검수용 사례입니다."')&&rawHTML.includes('rel="canonical" href="https://allthecom.co.kr/works/project/'+slug+'/"')&&rawHTML.includes('hreflang="en" href="https://allthecom.co.kr/en/works/project/'+slug+'/"'));
  check('server-rendered scalar content and embedded data escape HTML',rawHTML.includes('LOCAL QA ONLY &amp; &lt;review&gt;')&&!rawHTML.includes('<review>'));
  check('new project raw HTML does not claim the self-project film or outcome',!rawHTML.includes('공식 심볼을 확장한 브랜드 모션 · 자사 제작')&&!rawHTML.includes('외부 고객 프로젝트나 광고 성과를 의미하지 않습니다.'));
  const rawEN=await visitor.request.get(BASE+'/en/works/project/'+slug+'/');const englishHTML=await rawEN.text();
  check('English raw HTML includes fully authored English client scope and outcome',rawEN.status()===200&&englishHTML.includes('PRIVATE QA CLIENT')&&englishHTML.includes('Verify the connection between the editor and the public website.')&&englishHTML.includes('Synthetic evidence only. No external client claim.'));

  await visitorPage.goto(BASE + '/works/');
  const projectCard = visitorPage.locator('[data-project-card]').filter({ hasText:title });
  await projectCard.waitFor();
  check('the real WORKS frontend shows the newly published project', await projectCard.count() === 1);
  await visitorPage.locator('[data-filter=pr]').click();
  check('WORKS performs the real PR filter without showing unrelated self-project', await visitorPage.locator('[data-project-card]').count() === 1 && await projectCard.isVisible());
  await visitorPage.screenshot({ path:path.join(OUT,'03-works-published.png'), fullPage:true });
  await projectCard.locator('.project-visual').click();
  await visitorPage.locator('[data-case-title]').filter({ hasText:title }).waitFor();
  check('the actual project URL renders stored content from the common shell', visitorPage.url().endsWith('/works/project/' + slug + '/') && (await visitorPage.locator('[data-case-problem]').innerText()).includes('저장한 사례'));
  check('project gallery displays saved caption and loaded image', await visitorPage.locator('[data-case-gallery]').innerText().then(s=>s.includes('관리자에서 입력한 캡션')) && await visitorPage.locator('[data-case-gallery] img').evaluateAll(images=>images.length===1&&images.every(i=>i.complete&&i.naturalWidth>0)));
  const imageURL = await visitorPage.locator('[data-case-gallery] img').getAttribute('src');
  check('project canonical points to its unique public URL', (await visitorPage.locator('link[rel=canonical]').getAttribute('href')).endsWith('/works/project/' + slug + '/'));
  await visitorPage.screenshot({ path:path.join(OUT,'04-project-detail.png'), fullPage:true });
  await visitorPage.goto(BASE + '/en/works/project/' + slug + '/');
  await visitorPage.locator('[data-case-title]').filter({hasText:'Isolated end-to-end project'}).waitFor();
  check('the English detail uses the provided English title and summary', await visitorPage.locator('[data-case-summary]').innerText().then(s=>s.includes('A test case')));
  check('the English browser page preserves authored English body after API hydration',await visitorPage.locator('[data-case-client]').innerText()==='PRIVATE QA CLIENT'&&await visitorPage.locator('[data-case-result]').innerText()==='Synthetic evidence only. No external client claim.');
  await visitorPage.goto(BASE + '/');
  await visitorPage.locator('[data-project-card]').filter({hasText:title}).waitFor();
  check('featured project appears on the real homepage', await visitorPage.locator('[data-project-card]').filter({hasText:title}).count()===1);

  await editor.locator('[name=status]').selectOption('draft');
  savePromise=adminPage.waitForResponse(r=>r.url()===BASE+'/api/admin/projects/'+created.id&&r.request().method()==='PUT');
  await editor.getByRole('button',{name:'저장하기',exact:true}).click();await savePromise;
  const hiddenResponse=await visitorPage.goto(BASE+'/works/project/'+slug+'/');
  check('unpublishing returns an actual HTTP 404 for the project URL',hiddenResponse.status()===404);
  const hiddenEnglish=await visitor.request.get(BASE+'/en/works/project/'+slug+'/');
  check('unpublishing also returns HTTP 404 for the English URL',hiddenEnglish.status()===404);
  const hiddenImage=await visitor.request.get(imageURL);
  check('unpublishing revokes anonymous access to the project image',hiddenImage.status()===404);
  const refreshedProjects=visitorPage.waitForResponse(r=>r.url()===BASE+'/api/projects');
  await visitorPage.goto(BASE+'/works/');
  await refreshedProjects;
  check('unpublished project disappears from WORKS and its now-empty PR filter',await visitorPage.locator(`a[href="/works/project/${slug}/"]`).count()===0&&await visitorPage.locator('[data-filter=pr]').count()===0);
  const adminSession=await operator.request.get(BASE+'/api/admin/session').then(r=>r.json());
  const adminProjects=await operator.request.get(BASE+'/api/admin/projects').then(r=>r.json());
  const selfProject=adminProjects.projects.find(p=>p.slug==='all-the-comm');
  const hideSelf=await operator.request.put(BASE+'/api/admin/projects/'+selfProject.id,{headers:{Origin:BASE,'X-CSRF-Token':adminSession.csrf},data:{...selfProject,status:'draft'}});
  check('isolated self-case can be unpublished without modifying any main data',hideSelf.status()===200);
  for(const variant of ['/works/project/all-the-comm/index.html','/en/works/project/all-the-comm/index.html','/WORKS/PROJECT/ALL-THE-COMM/INDEX.HTML','/works//project//all-the-comm//index.html','/works/project/','/works/project/index.html']){
    const reply=await visitor.request.get(BASE+variant);check('no static publication bypass: '+variant,reply.status()===404);
  }
  check('no unhandled browser JavaScript errors during the full flow',pageErrors.length===0,pageErrors.join('; '));
  check('no external HTTP requests or email sends in the test',externalRequests.length===0,externalRequests.join('; '));
  check('isolated server does not leak open FileHandles during its lifecycle',!/DEP0137|Closing file descriptor|garbage collection/i.test(childLog));

  await fs.writeFile(path.join(OUT,'results.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'Fresh isolated local server and two independent Chromium browser contexts. Public contact and administrator interface exercised end to end. No production store or external mail used.',checks:results.length,failed:0,results},null,2));
  await stop();console.log(`${results.length} complete frontend-to-server-to-admin flow checks passed. Evidence: qa/full-flow/.`);
})().catch(async error=>{
  await fs.mkdir(OUT,{recursive:true});
  try{await visitorPage?.screenshot({path:path.join(OUT,'failure-visitor.png'),fullPage:true});await adminPage?.screenshot({path:path.join(OUT,'failure-admin.png'),fullPage:true});}catch{}
  await fs.writeFile(path.join(OUT,'results.json'),JSON.stringify({testedAt:new Date().toISOString(),checks:results.length,failed:1,error:error.stack,results,pageErrors,externalRequests},null,2));
  console.error(error.stack);await stop();process.exitCode=1;
});
