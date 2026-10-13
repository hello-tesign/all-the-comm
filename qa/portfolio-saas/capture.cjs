const {chromium}=require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const base='http://127.0.0.1:4194';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const child=spawn(process.execPath,['.private/portfolio-saas/ea-fixture-server.mjs'],{cwd:process.cwd(),windowsHide:true,env:{...process.env,E2E_PORT:'4194'},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
 let browser;
 try {
  let ready=false;
  for(let i=0;i<180;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}if(child.exitCode!==null)throw Error(logs);await sleep(500);}
  if(!ready)throw Error('Isolated server did not become ready: '+logs);
  browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1600,height:1050},deviceScaleFactor:1,locale:'ko-KR'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('navigation',{name:'제품 분야'}).getByRole('button',{name:'화장품',exact:true}).click();
  await page.getByRole('button',{name:'＋ 새 원고',exact:true}).click();
  await page.getByLabel('제품명',{exact:true}).fill('광채 쿠션 — 시연용 가상 제품');
  const details=page.locator('.optional-fields').filter({has:page.locator('summary',{hasText:'상세 조건'})});
  if(await details.count() && (await details.getAttribute('open'))===null)await details.locator('summary').click();
  await page.getByLabel('브랜드',{exact:true}).fill('포트폴리오 시연');
  await page.getByRole('button',{name:'＋ 자료 추가',exact:true}).click();
  await page.getByLabel('자료 제목',{exact:true}).fill('합성 데이터 · 제품 표기 시연');
  await page.getByLabel('자료 원문',{exact:true}).fill('포트폴리오 화면 시연을 위해 만든 가상 제품 자료입니다. 용량은 15g이며 제조사는 광채 마무리라고 소개합니다. 실제 지속력·피부별 사용감·판매 성과는 확인하지 않았습니다.');
  await page.getByRole('button',{name:'매거진 원고 작성 ↗',exact:true}).click();
  await page.getByRole('textbox',{name:'원고 편집기'}).waitFor({timeout:90000});
  await page.getByRole('button',{name:'현재 원고 검수',exact:true}).waitFor({state:'visible',timeout:90000});
  await sleep(4000);
  await page.screenshot({path:'qa/portfolio-saas/ea-editor-candidate.png',fullPage:false});
  const inspect=page.getByRole('tab',{name:'03 근거와 검수'});if(await inspect.isVisible()){await inspect.click();await sleep(500);await page.screenshot({path:'qa/portfolio-saas/ea-evidence-candidate.png',fullPage:false});}
  const exportTab=page.getByRole('tab',{name:'04 HTML 출력'});if(await exportTab.isVisible()){await exportTab.click();await sleep(500);await page.screenshot({path:'qa/portfolio-saas/ea-export-candidate.png',fullPage:false});}
  await fs.writeFile('qa/portfolio-saas/capture-result.json',JSON.stringify({capturedAt:new Date().toISOString(),source:'F:/Projects/3. ea.chdbsd.com/dist',fixture:'e2e/studio-server.mjs deterministic provider; isolated workspace store',privateDataRead:false,realGeneration:false,errors},null,2));
  console.log(JSON.stringify({screens:3,errors}));
 }finally{if(browser)await browser.close();child.kill();await fs.writeFile('qa/portfolio-saas/ea-server.log',logs);}
})().catch(e=>{console.error(e);process.exitCode=1});
