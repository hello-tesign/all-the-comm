import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try {
  for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:width===1440?960:844},reducedMotion:'reduce'});
    await page.goto(process.env.MOTION_URL||'http://127.0.0.1:4188/',{waitUntil:'networkidle'});
    await page.screenshot({path:`motion/qa/site-${width}.png`});
    await page.close();
  }
}finally{await browser.close();}
