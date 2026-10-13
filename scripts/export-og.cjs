const { chromium } = require('playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4183/');
    await page.setContent(`<!doctype html><html lang="ko"><head><style>
      @font-face{font-family:Brand;src:url('/fonts/PretendardSite.woff2')}
      *{box-sizing:border-box}body{margin:0;background:#061c25;color:#eff8f5;font-family:Brand,sans-serif;width:1200px;height:630px;padding:55px 64px;overflow:hidden;background:radial-gradient(ellipse at 86% 60%,#174e50,transparent 62%),#061c25}
      .logo{width:270px;height:auto}h1{font-size:69px;line-height:1.25;letter-spacing:-.065em;margin:100px 0 25px;font-weight:620;position:relative;z-index:2}em{font-style:normal;color:#59e3c6}p{font-size:20px;color:#a6c5c5;letter-spacing:.05em}.symbol{position:absolute;width:350px;right:90px;top:178px;transform:perspective(800px) rotateY(-23deg) rotate(-12deg);filter:drop-shadow(30px 40px 5px #03121855)}
      </style></head><body><img class="logo" src="/brand/logo-horizontal-on-dark.svg" alt="올더커뮤니케이션"><h1>브랜드의 생각을<br><em>세상의 장면으로.</em></h1><p>STRATEGY · CREATIVE · DIGITAL · PR</p><img class="symbol" src="/brand/logo-symbol.svg" alt=""></body></html>`);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
    await page.screenshot({ path: path.resolve('public/og.png') });
    console.log('Wrote public/og.png (1200 × 630).');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
