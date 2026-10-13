const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const out=__dirname,base='http://127.0.0.1:4173';
const records=[],errors=[],blocked=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked.push(r.request().url());return r.abort();}return r.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 async function go(url){await page.goto(base+url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await wait(1000);}
 async function move(sel,top=135){await page.locator(sel).first().evaluate((el,t)=>scrollTo({top:el.getBoundingClientRect().top+scrollY-t,behavior:'instant'}),top);await wait(750);}
 async function snap(name){await page.screenshot({path:path.join(out,name+'.png')});records.push({name,...await page.evaluate(()=>({url:location.href,viewport:[innerWidth,innerHeight],scrollY,scrollWidth:document.documentElement.scrollWidth,legacy:[...document.querySelectorAll('#brand-canvas,.glass-plane,.discipline-art,.chapter-orbit,.hero-art,.channel-composition,.project-orbit')].filter(x=>x.getClientRects().length).map(x=>x.className||x.id),visibleImages:[...document.querySelectorAll('main img')].filter(x=>{let r=x.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).map(x=>{let r=x.getBoundingClientRect();return {src:x.currentSrc,loaded:x.complete&&x.naturalWidth>0,display:[r.width,r.height],original:[x.naturalWidth,x.naturalHeight],fit:getComputedStyle(x).objectFit}}),captions:[...document.querySelectorAll('figcaption,.evidence-hero-caption,.sample-output footer')].filter(x=>{let r=x.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).map(x=>({text:x.textContent,top:x.getBoundingClientRect().top,bottom:x.getBoundingClientRect().bottom,scrollHeight:x.scrollHeight,clientHeight:x.clientHeight}))}))});}
 await go('/');
 for(let i=0;i<3;i++){await page.locator('[data-evidence-select]').nth(i).click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await wait(450);await snap('home-hero-'+i);}
 for(const id of await page.locator('[data-service-choice]').evaluateAll(a=>a.map(x=>x.dataset.serviceChoice))){await page.locator('[data-service-choice="'+id+'"]').click();await move('.capability-tabs');await snap('home-service-'+id);}
 for(let i=0;i<4;i++){await page.locator('[data-process-step]').nth(i).click();await move('.process-tabs');await snap('home-process-'+i);}
 await move('.about-preview');await snap('home-about');
 await go('/works/');await snap('works-top');
 for(const id of await page.locator('[data-service-choice]').evaluateAll(a=>a.map(x=>x.dataset.serviceChoice))){await page.locator('[data-service-choice="'+id+'"]').click();await move('.capability-tabs',110);await snap('works-service-'+id);}
 await go('/team/');await snap('team-top');
 for(let i=0;i<9;i++){await page.locator('.discipline-nav button').nth(i).click();await move('.discipline-stage',115);await snap('team-role-'+i);}
 await go('/about/');await snap('about-top');await move('.evidence-about-photo',110);await snap('about-photo');await move('.principles-section');await snap('about-principles');
 await go('/process/');await snap('process-top');
 for(let i=1;i<=4;i++){await move('#step-'+i,155);await snap('process-step-'+i);}
 await page.setViewportSize({width:1440,height:700});await move('#step-2',120);await snap('process-short-700');
 await page.setViewportSize({width:1440,height:1000});await go('/works/project/all-the-comm/');await snap('self-top');await move('.case-cover',115);await snap('self-cover');await move('.evidence-self-detail',115);await snap('self-inquiry');
 await go('/contact/');await snap('contact-top');await move('#inquiry-form',120);await snap('contact-form');
 await page.setViewportSize({width:390,height:844});
 for(const [name,url,sel] of [['mobile-home','/','.evidence-hero'],['mobile-work','/works/#hospital','.capability-tabs'],['mobile-about','/about/','.evidence-about-photo'],['mobile-process','/process/','#step-2'],['mobile-contact','/contact/','#inquiry-form']]){await go(url);await move(sel,100);await snap(name);}
 await fs.writeFile(path.join(out,'observations.json'),JSON.stringify({generated:new Date().toISOString(),records,errors,blockedWrites:blocked},null,2));
 await browser.close();console.log(JSON.stringify({count:records.length,errors,blockedWrites:blocked.length,overflow:records.filter(x=>x.scrollWidth>x.viewport[0]).map(x=>x.name),legacy:records.filter(x=>x.legacy.length).map(x=>({name:x.name,legacy:x.legacy})),broken:records.filter(x=>x.visibleImages.some(y=>!y.loaded)).map(x=>x.name)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
