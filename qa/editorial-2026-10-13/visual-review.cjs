const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const out=path.join(__dirname,'visual');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const routes={about:['.page-hero','.about-story','.apd-about-proof','.healthcare-about'],home:['.evidence-hero','.projects-section'],works:['.page-hero','.projects-section'],team:['.team-proof'],contact:['.contact-guide'],process:['.apd-process-depth']};
 const observations=[];
 for(const[name,selectors]of Object.entries(routes)){
  await page.goto('http://127.0.0.1:4173/'+(name==='home'?'':name+'/'),{waitUntil:'networkidle'});
  for(const selector of selectors){const target=page.locator(selector).first();if(!await target.count()){observations.push({name,selector,missing:true});continue;}await target.scrollIntoViewIfNeeded();await page.waitForTimeout(250);await target.screenshot({path:path.join(out,name+'-'+selector.replace(/[^a-z-]/g,'')+'.png')});observations.push({name,selector,text:(await target.innerText()).slice(0,8000)});}
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,name+'-top.png')});
 }
 await fs.writeFile(path.join(out,'observations.json'),JSON.stringify(observations,null,2));await browser.close();console.log('Saved integrated visual evidence');
})().catch(e=>{console.error(e);process.exitCode=1});
