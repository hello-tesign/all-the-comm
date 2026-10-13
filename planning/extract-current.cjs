const { chromium } = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage();
 await page.goto('https://allthecom.co.kr/',{waitUntil:'networkidle',timeout:60000});
 const result=await page.evaluate(()=>({
  images:[...document.images].map(e=>({src:e.src,alt:e.alt,width:e.naturalWidth,height:e.naturalHeight})),
  backgrounds:[...document.querySelectorAll('*')].map(e=>({tag:e.tagName,id:e.id,class:e.className,url:getComputedStyle(e).backgroundImage})).filter(x=>x.url!=='none'),
  scripts:[...document.scripts].map(e=>e.src).filter(Boolean),
  sections:[...document.querySelectorAll('section')].map(e=>({id:e.id,text:e.innerText.trim()}))
 }));
 fs.writeFileSync(__dirname+'/evidence/current-source.html',await page.content());
 fs.writeFileSync(__dirname+'/evidence/current-assets.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
 } finally { await browser.close(); }
})();
