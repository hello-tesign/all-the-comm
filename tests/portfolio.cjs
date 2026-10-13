const {chromium,firefox,webkit}=require('playwright');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const out='qa/portfolio-2026-10-12';
(async()=>{
 const checks=[],errors=[];const check=(name,ok)=>{assert(ok,name);checks.push({name,passed:true})};
 const ko=(await (await fetch(base+'/api/projects')).json()).projects;
 const en=(await (await fetch(base+'/api/projects?lang=en')).json()).projects;
 const additions=ko.filter(p=>p.englishPublished===false);
 check('Five source-backed projects added to Korean only',additions.length===5&&ko.length===6&&en.length===1);
 const sitemap=await(await fetch(base+'/sitemap.xml')).text();
 for(const p of additions){check(p.slug+' held from English route',(await fetch(base+'/en/works/project/'+p.slug+'/')).status===404);check(p.slug+' held from English API',(await fetch(base+'/api/projects/'+p.slug+'?lang=en')).status===404);check(p.slug+' absent from English sitemap',!sitemap.includes('/en/works/project/'+p.slug+'/'));}
 for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
  const browser=await engine.launch();try{
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   await page.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
   page.on('pageerror',e=>errors.push(name+': '+e.message));
   await page.goto(base+'/works/');await page.locator('[data-project-card]').nth(5).waitFor();
   check(name+' six portfolio entries',await page.locator('[data-project-card]').count()===6);
   check(name+' every screenshot fits inside its frame',await page.locator('.portfolio-shot').evaluateAll(es=>es.every(el=>{const frame=el.getBoundingClientRect(),img=el.querySelector('img').getBoundingClientRect();return img.width<=frame.width+1&&img.height<=frame.height+1})));
   check(name+' ten service choices',await page.locator('.capability-tabs [role=tab]').count()===10);
   await page.locator('[data-filter=it]').click();check(name+' IT filter retains implemented work',await page.locator('[data-project-card]').count()===6);
   await page.locator('[data-filter=video]').click();check(name+' video filter only shows video case',await page.locator('[data-project-card]').count()===1);
   await page.locator('[data-filter=all]').click();
   for(const p of additions){
    const response=await page.goto(base+'/works/project/'+p.slug+'/');await page.locator('.capture-open').first().waitFor();
    check(name+' '+p.slug+' complete case page',response.status()===200&&(await page.locator('h1').textContent())===p.title);
    check(name+' '+p.slug+' visible honest classification',(await page.locator('[data-case-type]').textContent()).includes('제작자'));
    check(name+' '+p.slug+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(name+' '+p.slug+' connected heading and description',await page.locator('.case-story').evaluateAll(es=>es.every(el=>{const title=el.querySelector('h2').getBoundingClientRect(),copy=el.lastElementChild.getBoundingClientRect();return Math.abs(title.left-copy.left)<1&&copy.top>=title.bottom})));
    const shot=page.locator('.capture-open').first();await shot.click();await page.locator('#capture-viewer[open]').waitFor();
    await page.locator('[data-viewer-scale]').click();check(name+' '+p.slug+' readable full size',await page.locator('#capture-viewer').evaluate(el=>el.classList.contains('is-original')));
    await page.keyboard.press('Escape');check(name+' '+p.slug+' viewer returns focus',await shot.evaluate(el=>el===document.activeElement));
    for(const galleryImage of await page.locator('[data-case-gallery] img').all()){
     await galleryImage.scrollIntoViewIfNeeded();
     await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await galleryImage.elementHandle());
     await galleryImage.evaluate(el=>el.decode());
    }
    check(name+' '+p.slug+' all images load',await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.hasAttribute('src')).map(i=>i.decode()));return [...document.images].filter(i=>i.hasAttribute('src')).every(i=>i.naturalWidth>0)}));
   }
   await page.goto(base+'/works/#projects');await page.locator('[data-project-card]').nth(5).waitFor();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
   check(name+' reduced motion leaves all labels visible',await page.locator('[data-project-card] h3').evaluateAll(es=>es.every(el=>Number(getComputedStyle(el).opacity)===1)));
   if(name==='chromium'){
    await page.screenshot({path:out+'/works-desktop.png',fullPage:true});
    await page.goto(base+'/works/project/sojukdoo-concept/');await page.locator('.capture-open').first().waitFor();await page.screenshot({path:out+'/case-desktop.png',fullPage:true});
   }
  }finally{await browser.close()}
 }
 check('No browser script errors',errors.length===0);
 await fs.writeFile(out+'/results.json',JSON.stringify({date:new Date().toISOString(),scope:'Korean desktop 1440. Read-only local browser checks; English non-publication gate only, no English refinement.',passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
