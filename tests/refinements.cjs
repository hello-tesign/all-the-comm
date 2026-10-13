const fs = require('node:fs');
const path = require('node:path');
let pw; try { pw = require('playwright'); } catch { pw = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const out = path.join(__dirname, '../qa/round-02-glass');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
fs.mkdirSync(out, {recursive:true});
const checks = [];
const check = (name, pass, detail) => checks.push({name, pass, detail});
(async () => {
 for (const engine of ['chromium', 'webkit']) {
  const browser = await pw[engine].launch();
  try {
   for (const width of [300, 390, 1440]) {
    const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base); await page.evaluate(()=>document.fonts.ready);
    const skip = page.locator('.skip-link');
    check(`${engine}/${width} skip link hidden without focus`, await skip.evaluate(e=>getComputedStyle(e).clipPath==='inset(50%)'));
    await page.keyboard.press('Tab');
    check(`${engine}/${width} keyboard skip link visible`, await skip.evaluate(e=>e===document.activeElement&&getComputedStyle(e).clipPath==='none'&&e.getBoundingClientRect().top>=0));
    await page.keyboard.press('Enter');
    check(`${engine}/${width} skip link reaches content`,new URL(page.url()).hash==='#main');
    await page.mouse.click(width-10,150);
    const section=page.locator('.glass-services');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({path:path.join(out,`${engine}-${width}-services.png`)});
    check(`${engine}/${width} four custom service illustrations`,await page.locator('.service-glass .service-sculpture').count()===4);
    check(`${engine}/${width} no width overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const card=page.locator('.service-glass').first();
    await card.hover({position:{x:25,y:25}});
    check(`${engine}/${width} reduced motion prevents card tilt`,await card.evaluate(e=>getComputedStyle(e).transform==='none'));
    await card.click();
    check(`${engine}/${width} service card opens matching detail`,new URL(page.url()).pathname==='/services/'&&new URL(page.url()).hash==='#strategy'&&await page.locator('#strategy h2').innerText()==='Strategy.');
    check(`${engine}/${width} no JS errors`,errors.length===0,errors);
    await page.close();
   }
   const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
   await page.goto(base); const card=page.locator('.service-glass').first();
   await card.hover({position:{x:40,y:40}}); await page.waitForTimeout(500);
   check(`${engine} pointer changes glass light and perspective`,await card.evaluate(e=>e.style.getPropertyValue('--glass-rx')!==''&&e.style.getPropertyValue('--glass-rx')!=='0deg'));
   await page.emulateMedia({reducedMotion:'reduce'});
   check(`${engine} live motion preference disables tilt`,await card.evaluate(e=>getComputedStyle(e).transform==='none'));
   await page.close();
  } finally { await browser.close(); }
 }
 const report={total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2)); process.exitCode=report.failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
