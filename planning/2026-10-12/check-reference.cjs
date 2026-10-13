const { chromium } = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = __dirname, out = path.join(root, 'reference-qa');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const [name, width, height, reducedMotion] of [['desktop', 1440, 1000, 'no-preference'], ['mobile', 390, 844, 'no-preference'], ['reduced', 1440, 1000, 'reduce']]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion, colorScheme: 'light' });
      const errors = [], blocked = [];
      await page.route(/^https?:/, route => { blocked.push(route.request().url()); return route.abort(); });
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(pathToFileURL(path.join(root, 'sources/R01-index.html')).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(out, name + '-hero.png') });
      for (const selector of ['#services', '#works', '#team', '#contact']) {
        const el = page.locator(selector);
        if (await el.count()) { await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await page.screenshot({ path: path.join(out, name + selector + '.png') }); }
      }
      results.push({ name, width, errors, blocked, ...await page.evaluate(() => ({
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth > innerWidth,
        sections: [...document.querySelectorAll('section')].map(s => ({ id:s.id, heading:s.querySelector('h1,h2')?.textContent.trim() })),
        images: [...document.images].map(i => ({ src:i.getAttribute('src'), loaded:i.complete && i.naturalWidth > 0 })),
        externalScripts: [...document.scripts].map(s => s.src).filter(Boolean),
        nav: [...document.querySelectorAll('nav a, nav button')].map(el => ({ text:el.textContent.trim(), href:el.getAttribute('href'), target:el.dataset.scrollTarget })),
        forms:[...document.forms].map(f=>({action:f.getAttribute('action'),method:f.getAttribute('method')}))
      })) });
      await page.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
})().catch(e => { console.error(e); process.exit(1); });
