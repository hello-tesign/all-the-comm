const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.SERVER_TEST_PORT || 4183);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const DATA = path.join(ROOT, '.private', `server-test-${randomUUID()}`);
const PASSWORD = 'local-api-test-' + randomUUID();
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XcAAAAASUVORK5CYII=';
let child, cookie = '', csrf = '', checks = 0;
const results = [];
function check(name, fn) { fn(); results.push({name,passed:true});checks++; }
async function request(route, method = 'GET', payload, authenticated = false, extra = {}) {
  const headers = { Origin:ORIGIN, ...(payload === undefined ? {} : {'Content-Type':'application/json'}), ...(authenticated?{Cookie:cookie,'X-CSRF-Token':csrf}:{}), ...extra };
  const response = await fetch(ORIGIN+route,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),redirect:'manual'});
  const bytes = Buffer.from(await response.arrayBuffer());
  let data;try{data=JSON.parse(bytes.toString());}catch{data=bytes.toString();}
  return {status:response.status,data,bytes,headers:response.headers};
}
async function start() {
  child=spawn(process.execPath,['scripts/server.mjs'],{cwd:ROOT,env:{...process.env,PORT:String(PORT),HOST:'127.0.0.1',DATA_DIR:DATA,ADMIN_PASSWORD:PASSWORD,PUBLIC_ORIGIN:''},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
  for(let i=0;i<100;i++){
    if(child.exitCode!==null)throw new Error('Test server stopped: '+logs);
    try{const r=await request('/api/health');if(r.status===200)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error('Test server did not start: '+logs);
}
async function stop(){if(!child||child.exitCode!==null)return;await new Promise(resolve=>{child.once('exit',resolve);child.kill('SIGTERM');});child=null;}
function inquiry(overrides={}) {return {company:'QA 테스트 회사',name:'검수 담당자',phone:'010-0000-0000',email:'test@example.invalid',services:['strategy','it'],message:'로컬 검증용 문의입니다. 외부로 발송되지 않습니다.',consent:true,locale:'en',submissionKey:randomUUID(),...overrides};}
async function login(){const r=await request('/api/admin/login','POST',{password:PASSWORD});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=r.data.csrf;return r;}
(async()=>{
  await start();
  let r=await request('/api/services');check('10 services plus other and explicit attachment limits',()=>{assert.equal(r.data.services.length,11);assert.equal(r.data.attachmentLimits.bytesPerFile,3145728);});
  r=await request('/api/admin/inquiries');check('private inquiry list requires authentication',()=>assert.equal(r.status,401));
  r=await request('/api/admin/login','POST',{password:'incorrect-password'});check('wrong password rejected',()=>assert.equal(r.status,401));
  r=await request('/api/admin/login','POST',{password:PASSWORD},false,{Origin:'https://attacker.invalid'});check('cross-origin login rejected',()=>assert.equal(r.status,403));
  r=await login();check('HttpOnly SameSite Strict session and no-store',()=>{assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);assert.equal(r.headers.get('cache-control'),'no-store');});
  r=await request('/api/admin/projects','POST',{slug:'csrf-case',title:'CSRF'},true,{'X-CSRF-Token':'invalid'});check('admin writes require session CSRF token',()=>assert.equal(r.status,403));
  r=await request('/api/inquiries','POST',inquiry({consent:false}));check('privacy consent validated on server',()=>{assert.equal(r.status,422);assert.ok(r.data.fields.consent);});
  r=await request('/api/inquiries','POST',inquiry({services:['unknown']}));check('unknown service rejected',()=>assert.equal(r.status,422));
  r=await request('/api/inquiries','POST',inquiry({email:'invalid'}));check('email format validated',()=>assert.equal(r.status,422));
  r=await request('/api/inquiries','POST',inquiry({website:'spam'}));check('honeypot rejects automated field submission',()=>assert.equal(r.status,422));
  r=await request('/api/inquiries','POST',inquiry({attachments:[{name:'fake.pdf',type:'application/pdf',dataBase64:png}]}));check('attachment magic MIME and extension must agree',()=>assert.equal(r.status,422));
  r=await request('/api/inquiries','POST',inquiry({attachments:[{name:'payload.png',type:'image/png',dataBase64:Buffer.from('<svg onload="alert(1)"></svg>').toString('base64')}]}));check('SVG payload disguised as image rejected',()=>assert.equal(r.status,422));
  const payload=inquiry({attachments:[{name:'proof.png',type:'image/png',dataBase64:png}]});
  const concurrent=await Promise.all([request('/api/inquiries','POST',payload),request('/api/inquiries','POST',payload),request('/api/inquiries','POST',payload)]);
  const receipt=concurrent[0].data;
  check('concurrent retries create exactly one durable receipt',()=>{assert.equal(new Set(concurrent.map(x=>x.data.id)).size,1);assert.equal(concurrent.filter(x=>x.status===201).length,1);assert.ok(concurrent.every(x=>[200,201].includes(x.status)));});
  r=await request('/api/inquiries','POST',{...payload,message:'동일 키의 다른 문의 본문입니다.'});check('idempotency key cannot overwrite submitted content',()=>assert.equal(r.status,409));
  r=await request('/api/inquiries','POST',{...payload,submissionKey:randomUUID()});check('identical recent content deduplicated with a new request key',()=>assert.equal(r.data.id,receipt.id));
  r=await request(`/api/admin/inquiries/${receipt.id}`,'GET',undefined,true);const stored=r.data.inquiry;check('admin sees exact fields locale consent and attachment metadata',()=>{assert.equal(stored.message,payload.message);assert.equal(stored.locale,'en');assert.equal(stored.consent,true);assert.equal(stored.attachments.length,1);assert.equal(stored.delivery,'administrator-inbox');assert.equal(stored.emailStatus,'not-configured');assert.equal(stored.submissionKey,undefined);});
  const attachment=`/api/admin/inquiries/${receipt.id}/attachments/${stored.attachments[0].id}`;
  r=await request(attachment);check('attachment is unavailable without administrator authentication',()=>assert.equal(r.status,401));
  r=await request(attachment,'GET',undefined,true);check('authenticated attachment download has exact bytes and download-only headers',()=>{assert.equal(r.status,200);assert.deepEqual(r.bytes,Buffer.from(png,'base64'));assert.match(r.headers.get('content-disposition'),/^attachment/);assert.equal(r.headers.get('content-type'),'application/octet-stream');});
  r=await request(`/api/admin/inquiries/${receipt.id}`,'PATCH',{status:'in-progress'},true);check('inquiry processing status can be saved',()=>assert.equal(r.status,200));
  r=await request('/.private/server/store.json');check('private data is outside static paths',()=>assert.equal(r.status,404));
  r=await request('/%2e%2e%5csrc/data/company.json');check('encoded Windows path traversal rejected',()=>assert.equal(r.status,404));
  r=await request('/api/projects');check('initial public portfolio contains no invented external clients',()=>{assert.ok(r.data.projects.every(p=>p.slug==='all-the-comm'));});
  const project={slug:'qa-project',title:'검수용 <script> 사례',titleEn:'QA project',summary:'검수용 실제 데이터 흐름 확인',summaryEn:'Local workflow verification',client:'QA fixture',type:'검수용',year:'2026',period:'2026.10',industry:'테스트',services:['content','it'],scope:'로컬 테스트',problem:'영구 저장 확인',strategy:'실제 요청으로 흐름 점검',execution:'비공개 등록 후 공개 전환',result:'검증용 자료이며 외부 실적이 아님',status:'draft',publicationConfirmed:false,featured:false,order:0,videoUrls:[]};
  r=await request('/api/admin/projects','POST',project,true);check('administrator creates a draft project',()=>assert.equal(r.status,201));const projectId=r.data.project.id;
  r=await request('/api/projects/qa-project');check('draft detail API is private',()=>assert.equal(r.status,404));
  r=await request('/works/project/qa-project/');check('draft public page is private',()=>assert.equal(r.status,404));
  r=await request(`/api/admin/projects/${projectId}/media`,'POST',{name:'visual.png',type:'image/png',dataBase64:png,alt:'작업 이미지',caption:'검수 시편'},true);check('admin image upload succeeds',()=>assert.equal(r.status,201));const media=r.data.image;
  r=await request(media.url);check('draft uploaded media is not public',()=>assert.equal(r.status,404));
  r=await request(media.url,'GET',undefined,true);check('admin can preview draft uploaded media',()=>assert.equal(r.status,200));
  r=await request(`/api/admin/projects/${projectId}`,'PUT',{...project,status:'published'},true);check('publication requires explicit disclosure confirmation',()=>assert.equal(r.status,422));
  r=await request(`/api/admin/projects/${projectId}`,'PUT',{...project,status:'published',publicationConfirmed:true,publicationNote:'Local test',images:[{id:media.id,alt:'수정 설명',caption:'수정 캡션'}]},true);check('approved complete case can publish',()=>assert.equal(r.status,200));
  r=await request('/api/projects/qa-project');check('published project fields and media appear in public API',()=>{assert.equal(r.status,200);assert.equal(r.data.project.title,project.title);assert.equal(r.data.project.titleEn,'QA project');assert.equal(r.data.project.images[0].alt,'수정 설명');assert.equal(r.data.project.cover,media.url);});
  r=await request(media.url);check('published project image becomes public',()=>assert.equal(r.status,200));
  r=await request('/api/admin/projects','GET',undefined,true);const ids=r.data.projects.map(p=>p.id).reverse();
  r=await request('/api/admin/projects/reorder','POST',{ids},true);check('project order persists through reorder API',()=>assert.equal(r.status,200));
  r=await request('/sitemap.xml');check('dynamic sitemap contains published case URLs',()=>assert.match(r.data,/works\/project\/qa-project/));
  await stop();await start();await login();
  r=await request(`/api/admin/inquiries/${receipt.id}`,'GET',undefined,true);check('inquiry attachment metadata and processing state survive restart',()=>{assert.equal(r.status,200);assert.equal(r.data.inquiry.status,'in-progress');assert.equal(r.data.inquiry.attachments[0].id,stored.attachments[0].id);});
  r=await request('/api/projects/qa-project');check('published case and image metadata survive restart',()=>{assert.equal(r.status,200);assert.equal(r.data.project.images[0].alt,'수정 설명');});
  r=await request(`/api/admin/projects/${projectId}`,'PUT',{...project,status:'draft',publicationConfirmed:true},true);check('published project can be made private',()=>assert.equal(r.status,200));
  r=await request('/api/projects/qa-project');check('unpublishing removes direct public API access',()=>assert.equal(r.status,404));
  r=await request(media.url);check('unpublishing also removes public image access',()=>assert.equal(r.status,404));
  r=await request('/sitemap.xml');check('unpublished project is absent from sitemap',()=>assert.doesNotMatch(r.data,/qa-project/));
  r=await request(`/api/admin/projects/${projectId}`,'DELETE',{},true);check('project deletion works',()=>assert.equal(r.status,200));
  let blocked=false;for(let i=0;i<7;i++){r=await request('/api/inquiries','POST',inquiry({message:`독립적인 속도 제한 검증 요청 ${i}번 입니다.`}));if(r.status===429){blocked=true;break;}}
  check('new inquiry rate limit rejects excess submissions',()=>assert.equal(blocked,true));
  r=await request('/api/admin/logout','POST',{},true);check('logout succeeds',()=>assert.equal(r.status,200));
  r=await request('/api/admin/inquiries','GET',undefined,true);check('logout invalidates existing session',()=>assert.equal(r.status,401));
  await stop();
  await fs.mkdir(path.join(ROOT,'qa','server'),{recursive:true});
  await fs.writeFile(path.join(ROOT,'qa','server','results.json'),JSON.stringify({testedAt:new Date().toISOString(),checks,failed:0,scope:'Local isolated API server; no external email sent',results},null,2));
  // Test data is synthetic and isolated. Keep the directory for reproducible failure/persistence review.
  console.log(`${checks} backend checks passed; report qa/server/results.json. Synthetic test data retained in an isolated private directory.`);
})().catch(async error=>{console.error(error.stack);await stop();process.exitCode=1;});
