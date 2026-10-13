const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');
const out=__dirname,base='http://127.0.0.1:4173';
const records=[],errors=[],writes=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
 const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:900},locale:'ko-KR'});
 await context.route('**/*',r=>{if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();writes.push(r.request().url());return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
 async function go(route){await page.goto(base+route,{waitUntil:'networkidle'});await page.waitForTimeout(600);}
 async function load(locator){await locator.locator('img').evaluateAll(async es=>Promise.all(es.map(i=>i.decode().catch(()=>{}))));}
 async function shot(name,locator,viewport=false){await locator.scrollIntoViewIfNeeded();await load(locator);await page.waitForTimeout(1200);const record=await locator.evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,width:r.width,text:el.innerText,overflow:document.documentElement.scrollWidth>innerWidth,images:[...el.querySelectorAll('img')].map(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);return {src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,natural:[i.naturalWidth,i.naturalHeight],rendered:[b.width,b.height],fit:s.objectFit,clip:s.clipPath};}),smallText:[...el.querySelectorAll('small,figcaption,.eyebrow')].filter(e=>e.checkVisibility()).map(e=>({text:e.innerText,font:parseFloat(getComputedStyle(e).fontSize)}))};});records.push({name,...record});await(viewport?page:locator).screenshot({path:path.join(out,name+'.png')});}
 await go('/');
 for(let i=0;i<3;i++){await page.locator('[data-evidence-select]').nth(i).click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1100);await page.screenshot({path:path.join(out,'home-hero-'+i+'.png')});}
 for(let i=0;i<8;i++){const tab=page.locator('#capabilities [role=tab]').nth(i);await tab.click();const panel=page.locator('#'+await tab.getAttribute('aria-controls'));await shot('home-service-'+i,panel);}
 await shot('home-capabilities-context',page.locator('#capabilities'),true);
 await shot('home-company',page.locator('.about-preview'));
 await go('/about/');await shot('about-story',page.locator('.about-story'));await shot('about-principles',page.locator('.principles-section'));await shot('about-company',page.locator('.company-section'));
 await go('/team/');
 for(let i=0;i<9;i++){const tab=page.locator('[data-capabilities] [role=tab]').nth(i);await tab.click();await shot('team-role-'+i,page.locator('#'+await tab.getAttribute('aria-controls')));}
 await go('/process/');
 for(let i=0;i<4;i++){await page.locator('.process-chapter').nth(i).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.3,behavior:'instant'}));await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'process-stage-'+i+'.png')});records.push({name:'process-'+i,active:await page.locator('.process-chapters').getAttribute('data-active-step')});}
 await go('/works/');await page.locator('#choice-it').click();await shot('works-it-service',page.locator('#panel-it'));
 const more=page.locator('[data-load-more]');while(await more.isVisible()){await more.click();await page.waitForTimeout(120);}
 const cards=page.locator('[data-project-card]');
 for(let i=0;i<await cards.count();i++){const card=cards.nth(i),slug=await card.getAttribute('data-project-slug');await shot('work-card-'+slug,card);}
 const slugs=['kings-franchise','kfood-dashboard','content-operations','sales-rehearsal','ezylens-studio','sojukdoo-concept'];
 for(const slug of slugs){await go('/works/project/'+slug+'/');await shot('case-'+slug+'-title',page.locator('.case-hero'));await shot('case-'+slug+'-cover',page.locator('[data-case-cover]'));
  const shots=page.locator('[data-case-cover] .capture-open,[data-case-gallery] .capture-open');
  for(let i=0;i<await shots.count();i++){const btn=shots.nth(i);await btn.scrollIntoViewIfNeeded();await load(btn);await page.waitForTimeout(1200);
   if(i>0)await shot('case-'+slug+'-gallery-'+i,btn);
   if(slug==='sales-rehearsal'||slug==='content-operations'||slug==='ezylens-studio'){
    await btn.click();const viewer=page.locator('#capture-viewer');await load(viewer);await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'viewer-'+slug+'-'+i+'.png')});
    const img=viewer.locator('img');records.push({name:'viewer-'+slug+'-'+i,state:await img.evaluate(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);return{src:i.src,width:b.width,height:b.height,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,fit:s.objectFit,clip:s.clipPath};})});
    if(i===0){await viewer.locator('[data-viewer-scale]').click();await page.screenshot({path:path.join(out,'viewer-'+slug+'-original.png')});}
    await page.keyboard.press('Escape');records.push({name:'viewer-return-'+slug+'-'+i,focus:await btn.evaluate(el=>el===document.activeElement),closed:!await viewer.isVisible()});
   }
  }
 }
 await fs.writeFile(path.join(out,'visual-observations.json'),JSON.stringify({date:new Date().toISOString(),viewport:[1440,900],scope:'Read-only isolated Chromium; no existing IAB access; production build screenshots',records,errors,writes},null,2));
 await browser.close();console.log(JSON.stringify({records:records.length,errors:errors.length,writes:writes.length,brokenImages:records.flatMap(r=>(r.images||[]).filter(i=>!i.loaded).map(i=>({name:r.name,...i}))),overflow:records.filter(r=>r.overflow).map(r=>r.name)}));
}
run().catch(async e=>{await fs.writeFile(path.join(out,'visual-execution-error.txt'),String(e.stack));console.error(e);process.exitCode=1;});
