const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');
const base='http://127.0.0.1:4173',out=__dirname;
(async()=>{
 const result={date:new Date().toISOString(),base,pages:[],pageErrors:[],consoleErrors:[],failedRequests:[],blockedWrites:[]};
 const browser=await chromium.launch();
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',route=>{
   if(['GET','HEAD','OPTIONS'].includes(route.request().method()))return route.continue();
   result.blockedWrites.push({url:route.request().url(),method:route.request().method()});return route.abort();
  });
  const page=await context.newPage();
  page.on('pageerror',error=>result.pageErrors.push({url:page.url(),message:error.message}));
  page.on('console',message=>{if(message.type()==='error')result.consoleErrors.push({url:page.url(),message:message.text()});});
  page.on('requestfailed',request=>result.failedRequests.push({url:request.url(),error:request.failure()}));
  let response=await page.goto(base+'/',{waitUntil:'load',timeout:15000});
  for(const [index,route,nav]of [[0,'/',null],[1,'/works/','WORKS'],[2,'/contact/','CONTACT']]){
   if(nav)[response]=await Promise.all([page.waitForNavigation({waitUntil:'load',timeout:15000}),page.locator('.desktop-nav').getByRole('link',{name:nav,exact:true}).click()]);
   await page.waitForTimeout(1500);
   const entry={route,url:page.url(),status:response?.status(),title:await page.title(),h1:await page.locator('h1').innerText(),bodyVisible:await page.locator('main').isVisible()};
   if(index===0){const img=page.locator('.evidence-hero-frame:not([hidden]) img');await img.waitFor({state:'visible'});await page.waitForFunction(()=>{const i=document.querySelector('.evidence-hero-frame:not([hidden]) img');return i?.complete&&i.naturalWidth>0},{timeout:5000});entry.hero=await img.evaluate(i=>({src:i.getAttribute('src'),alt:i.alt,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}));}
   if(index===2)entry.contactForm={visible:await page.locator('#inquiry-form').isVisible(),submitButtonCount:await page.locator('#inquiry-form button[type=submit]').count(),status:await page.locator('#form-status').textContent()};
   await page.screenshot({path:path.join(out,index+'-'+(nav?.toLowerCase()||'home')+'.png')});
   result.pages.push(entry);
  }
 }catch(error){result.executionError=error.stack||error.message;}finally{await browser.close();}
 result.passed=!result.executionError&&result.pages.length===3&&result.pages.every(p=>p.status===200&&p.bodyVisible&&p.url===base+p.route)&&result.pages[0].hero?.naturalWidth>0&&result.pages[2].contactForm?.visible&&result.pageErrors.length===0&&result.consoleErrors.length===0&&result.blockedWrites.length===0;
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
