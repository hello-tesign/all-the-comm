const {chromium}=require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../qa/round-01');fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});if(!response.ok())throw new Error('Preview returned '+response.status());await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1100);
 await page.screenshot({path:path.join(dir,name+'-top.png')});
 for(const section of ['#approach','.expression-section','.work-section','.services-section','.site-footer']){
 await page.locator(section).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:path.join(dir,name+'-'+section.replace(/[.#]/g,'')+'.png')});}
 await page.evaluate(()=>document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-visible')));
 await page.screenshot({path:path.join(dir,name+'-full.png'),fullPage:true});
 console.log(JSON.stringify({name,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),errors}));await page.close();
} }finally{await browser.close();}})();
