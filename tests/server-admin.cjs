const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {randomUUID}=require('node:crypto');
let pw;try{pw=require('playwright');}catch{pw=require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const ROOT=path.resolve(__dirname,'..'),PORT=Number(process.env.SERVER_TEST_PORT||4184),BASE=`http://127.0.0.1:${PORT}`;
const DATA=path.join(ROOT,'.private','admin-ui-test-'+randomUUID()),PASSWORD='local-ui-test-'+randomUUID();
let child,browser;const results=[];
const record=(name,condition)=>{assert.ok(condition,name);results.push({name,passed:true});};
async function stop(){await browser?.close();if(child&&child.exitCode===null)await new Promise(resolve=>{child.once('exit',resolve);child.kill('SIGTERM');});}
(async()=>{
  child=spawn(process.execPath,['scripts/server.mjs'],{cwd:ROOT,env:{...process.env,HOST:'127.0.0.1',PORT:String(PORT),DATA_DIR:DATA,ADMIN_PASSWORD:PASSWORD,PUBLIC_ORIGIN:''},windowsHide:true,stdio:'pipe'});
  let started=false;for(let i=0;i<100;i++){try{if((await fetch(BASE+'/api/health')).ok){started=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(started,'server starts');
  const submission=await fetch(BASE+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json',Origin:BASE},body:JSON.stringify({company:'운영 화면 검수',name:'검수자',phone:'010-0000-0000',email:'admin-ui@example.invalid',services:['it'],message:'실제 메일을 보내지 않는 관리자 브라우저 테스트입니다.',consent:true,submissionKey:randomUUID()})});assert.equal(submission.status,201);
  browser=await pw.chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'/admin/');await page.getByLabel('관리자 비밀번호').fill(PASSWORD);await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByRole('heading',{name:'회사 운영',exact:true}).waitFor();
  record('administrator signs in through browser UI',await page.locator('#workspace').isVisible());
  await page.getByRole('button',{name:'상세 확인',exact:true}).click();await page.locator('#inquiry-detail').waitFor({state:'visible'});record('inquiry detail includes received text',await page.locator('#inquiry-detail').innerText().then(t=>t.includes('실제 메일을 보내지 않는')));
  await page.getByLabel('처리 상태').selectOption('closed');await page.getByRole('button',{name:'상태 저장',exact:true}).click();await page.locator('#status').filter({hasText:'문의 상태를 저장했습니다.'}).waitFor();record('inquiry status updated through UI',await page.locator('#inquiry-list').innerText().then(t=>t.includes('처리 완료')));
  await fs.mkdir(path.join(ROOT,'qa','server'),{recursive:true});await page.screenshot({path:path.join(ROOT,'qa','server','admin-inbox-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'프로젝트',exact:true}).click();await page.getByRole('button',{name:'새 사례 등록',exact:true}).click();
  const form=page.locator('#project-form');await form.locator('[name=title]').fill('관리 화면 <script> 검수');await form.locator('[name=slug]').fill('admin-ui-case');await form.locator('[name=client]').fill('UI fixture');await form.locator('[name=year]').fill('2026');await form.locator('[name=summary]').fill('관리자 UI에서 저장한 비공개 사례');await form.locator('[name=titleEn]').fill('Admin UI case');await form.locator('[name=summaryEn]').fill('A private test case');await form.locator('[name=scope]').fill('로컬 기능 검증');await form.locator('[name=problem]').fill('운영 담당자의 편집 흐름 확인');await form.locator('[name=strategy]').fill('브라우저에서 실제 저장과 공개를 확인');await form.locator('[name=execution]').fill('초안 작성과 이미지 업로드');await form.locator('[name=result]').fill('검증 자료이며 고객 실적이 아닙니다.');await form.locator('[name=services][value=it]').check();
  await form.getByRole('button',{name:'저장하기',exact:true}).click();await page.locator('#status').filter({hasText:'사례를 저장했습니다.'}).waitFor();record('draft project created with escaped content through UI',await page.locator('#project-list').innerText().then(t=>t.includes('관리 화면 <script> 검수')));
  await page.locator('#image-upload').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XcAAAAASUVORK5CYII=','base64')});await page.getByRole('button',{name:'선택한 이미지 등록',exact:true}).click();await page.locator('.media-item img').waitFor();record('image upload and authenticated draft preview work',await page.locator('.media-item img').evaluate(img=>img.complete&&img.naturalWidth===1));
  await page.locator('[data-alt]').fill('검수용 단색 이미지');await page.locator('[data-caption]').fill('테스트 시편');await form.locator('[name=publicationConfirmed]').check();await form.locator('[name=status]').selectOption('published');await form.getByRole('button',{name:'저장하기',exact:true}).click();await page.locator('#project-preview').waitFor({state:'visible'});record('case can be published from completed editor',await page.locator('#project-list').innerText().then(t=>t.includes('공개')));
  const published=await fetch(BASE+'/api/projects/admin-ui-case').then(r=>r.json());record('published API immediately reflects editor fields',published.project.titleEn==='Admin UI case'&&published.project.images[0].alt==='검수용 단색 이미지');
  await page.screenshot({path:path.join(ROOT,'qa','server','admin-project-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});record('admin form has no horizontal overflow at 390px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(ROOT,'qa','server','admin-project-mobile.png'),fullPage:true});
  record('no browser page errors',errors.length===0);
  await page.getByRole('button',{name:'로그아웃',exact:true}).click();await page.getByRole('heading',{name:'관리자 로그인',exact:true}).waitFor();record('logout returns to login form',await page.locator('#login-panel').isVisible());
  await fs.writeFile(path.join(ROOT,'qa','server','admin-ui-results.json'),JSON.stringify({testedAt:new Date().toISOString(),checks:results.length,failed:0,results},null,2));await stop();console.log(`${results.length} administrator browser checks passed; captures qa/server/.`);
})().catch(async error=>{console.error(error.stack);await stop();process.exitCode=1;});
