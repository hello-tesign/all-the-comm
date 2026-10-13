const { chromium } = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const out = path.join(__dirname, 'evidence');
fs.mkdirSync(out, {recursive:true});
(async()=>{
  const browser = await chromium.launch({headless:true});
  const report=[];
  for (const [name,url] of [
    ['current','https://allthecom.co.kr/'],
    ['reference',pathToFileURL('C:/Users/home/Desktop/International-SOS-Global-Employee-Safety-EN-MOTION.html').href]
  ]) {
    for (const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
      const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url,{waitUntil:'load',timeout:60000});
      await page.waitForTimeout(1800);
      await page.screenshot({path:path.join(out,`${name}-${device}-top.png`)});
      const baseline=await page.evaluate(()=>({
        title:document.title,
        viewport:innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        scrollHeight:document.documentElement.scrollHeight,
        headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({tag:e.tagName,text:e.innerText.trim()})).filter(x=>x.text),
        visibleLinks:[...document.querySelectorAll('a')].filter(e=>e.getBoundingClientRect().width&&e.innerText.trim()).slice(0,35).map(e=>({text:e.innerText.trim(),href:e.getAttribute('href')})),
        imageCount:document.images.length,
        brokenImages:[...document.images].filter(e=>e.complete&&e.naturalWidth===0).length,
        sections:[...document.querySelectorAll('section')].map(e=>({id:e.id,height:Math.round(e.getBoundingClientRect().height)})),
        libraries:{jquery:typeof window.jQuery!=='undefined',gsap:typeof window.gsap!=='undefined'},
      }));
      for (const fraction of [.25,.5,.8]) {
        await page.evaluate(f=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f),fraction);
        await page.waitForTimeout(700);
        await page.screenshot({path:path.join(out,`${name}-${device}-${fraction}.png`)});
      }
      report.push({name,device,...baseline,errors});
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
