const {chromium}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{
 const out=__dirname;const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US'});
 await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
 const page=await context.newPage();try{
 const response=await page.goto('https://freefrontend.com/',{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(4000);await page.screenshot({path:path.join(out,'freefrontend-desktop-top.png')});
 await page.evaluate(()=>scrollTo(0,920));await page.waitForTimeout(1500);await page.screenshot({path:path.join(out,'freefrontend-desktop-feed.png')});
 const facts=await page.evaluate(()=>({url:location.href,title:document.title,bodyBackground:getComputedStyle(document.body).backgroundColor,bodyText:getComputedStyle(document.body).color,bodyFont:getComputedStyle(document.body).fontFamily,text:document.body.innerText.slice(0,2200),images:[...document.images].filter(i=>i.getBoundingClientRect().height>100).slice(0,8).map(i=>{const b=i.getBoundingClientRect(),p=i.parentElement,s=getComputedStyle(p);return{alt:i.alt,size:[b.width,b.height],natural:[i.naturalWidth,i.naturalHeight],parent:p.tagName+'.'+p.className,radius:s.borderRadius,background:s.backgroundColor};}),headings:[...document.querySelectorAll('h1,h2,h3')].slice(0,12).map(e=>{const s=getComputedStyle(e);return{text:e.textContent.slice(0,100),font:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight};})}));facts.status=response.status();await fs.writeFile(path.join(out,'freefrontend-observations.json'),JSON.stringify(facts,null,2));console.log(JSON.stringify(facts,null,2));
 }catch(e){await fs.writeFile(path.join(out,'freefrontend-error.txt'),String(e));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
