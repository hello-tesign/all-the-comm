const {chromium}=require('playwright');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
 await context.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/contact/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.inquiry-form').screenshot({path:'public/evidence/allthecomm-inquiry.png'});
 await fs.copyFile('public/evidence/allthecomm-inquiry.png','dist/evidence/allthecomm-inquiry.png');
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.screenshot({path:'qa/evidence-2026-10-12/home-first.png'});
 await browser.close();
 console.log('Captured the actual empty inquiry interface and first homepage. No submissions.');
})().catch(error=>{console.error(error.message);process.exitCode=1});
