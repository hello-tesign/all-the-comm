const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');
const out=path.join(__dirname,'final'),checks=[],errors=[],writes=[];
const check=(name,passed,detail)=>checks.push({name,passed:!!passed,detail});
(async()=>{
 await fs.mkdir(out,{recursive:true});
 for(const [name,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch();const context=await browser.newContext({viewport:{width:1440,height:900},locale:'ko-KR'});
  await context.route('**/*',r=>{if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();writes.push(r.request().url());return r.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({name,error:e.message}));
  await page.goto('http://127.0.0.1:4173/process/',{waitUntil:'networkidle'});await page.waitForTimeout(700);
  await page.locator('.process-chapter').nth(1).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.3,behavior:'instant'}));
  await page.waitForTimeout(1200);const active=page.locator('.process-cinema-art .chapter-art.is-current');
  await active.locator('img').evaluate(i=>i.decode());
  const detail=await active.evaluate(el=>{const img=el.querySelector('img'),r=img.getBoundingClientRect(),s=getComputedStyle(img);return {text:el.innerText,src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0,natural:[img.naturalWidth,img.naturalHeight],rendered:[r.width,r.height],fit:s.objectFit,overflow:document.documentElement.scrollWidth>innerWidth};});
  check(name+' active stage 2',await page.locator('.process-chapters').getAttribute('data-active-step')==='2');
  check(name+' verified editor capture loaded',detail.loaded&&detail.src==='/portfolio/saas-ea-editor.png',detail);
  check(name+' prototype attribution visible',detail.text.includes('콘텐츠 기획·편집 도구 · Review Atelier 시제품'),detail.text);
  check(name+' relevant message visible',detail.text.includes('어떤 자료를 근거로, 무엇을 말할지 정합니다.'),detail.text);
  check(name+' no cultural poster in process',await page.locator('.process-chapters img[src*="concept-city-culture"]').count()===0);
  check(name+' no horizontal overflow',!detail.overflow);
  await page.screenshot({path:path.join(out,name+'-process-stage-2.png')});
  await context.close();await browser.close();
 }
 check('runtime errors',errors.length===0,errors);check('write requests',writes.length===0,writes);
 await fs.writeFile(path.join(out,'process-results.json'),JSON.stringify({date:new Date().toISOString(),checks,errors,writes},null,2));
 console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed)},null,2));
 if(checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
