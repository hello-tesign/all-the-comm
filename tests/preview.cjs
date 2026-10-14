/* Playwright QA for the single-file site preview (scripts/build-preview.mjs output), opened from disk without a server.
   Usage: node tests/preview.cjs <path-to-preview.html>   Optional PW_CHROMIUM_PATH. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const file = path.resolve(process.argv[2] || 'dist-preview/site-preview.html');
const out = path.resolve(__dirname, '../qa/preview-2026-10-14');
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, pass, detail = null) => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass || detail === null ? '' : ' — ' + JSON.stringify(detail)}`); };

(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + file);
    const frame = () => page.frameLocator('#pv-iframe');
    const inner = () => page.frames().find(f => f !== page.mainFrame());
    const ready = async sel => { await page.waitForFunction(s => { const d = document.querySelector('#pv-iframe').contentDocument; return d && d.readyState === 'complete' && d.querySelector(s); }, sel, { timeout: 15000 }); await page.waitForTimeout(700); };
    await ready('[data-story].st-ready');
    check('home renders inside the preview with its scroll engine', true);
    await page.screenshot({ path: path.join(out, 'shell-home.png') });

    const routes = await page.evaluate(() => window.__DATA__.routes.map(r => r.path));
    check(`all ${routes.length} pages are listed`, routes.length >= 30 && routes.includes('/works/project/soulreset/') && routes.includes('/en/'));
    const broken = [];
    for (const r of routes) {
      await page.evaluate(p => { document.querySelector('[data-go="' + p + '"]')?.click() || document.querySelector('#pv-list [data-go="' + p + '"]').click(); }, r);
      await page.waitForFunction(() => { const d = document.querySelector('#pv-iframe').contentDocument; return d && d.readyState === 'complete' && d.querySelector('main'); }, null, { timeout: 15000 });
      await page.waitForTimeout(r.includes('/works/project/') ? 900 : 350);
      const st = await page.evaluate(() => { const d = document.querySelector('#pv-iframe').contentDocument; const h1 = d.querySelector('h1'); const imgs = [...d.images].filter(i => i.complete && i.getClientRects().length && !i.naturalWidth && i.getAttribute('loading') !== 'lazy').length; return { h1: h1 ? h1.textContent.trim().slice(0, 30) : '', imgs, css: d.styleSheets.length, url: document.querySelector('#pv-url').textContent }; });
      if (!st.h1 || st.imgs || st.css < 1 || st.url !== r) broken.push({ r, ...st });
    }
    check('every page loads with title, styles and images', broken.length === 0, broken);
    check('visit tracker counts every page', (await page.locator('#pv-count').textContent()).trim() === `${routes.length}/${routes.length}`);

    // case page content comes from embedded project data
    await page.evaluate(() => document.querySelector('#pv-list [data-go="/works/project/city-culture/"]').click());
    await ready('[data-case-cover] img');
    const caseState = await inner().evaluate(() => ({ title: document.querySelector('[data-case-title]').textContent, poster: document.querySelector('[data-case-cover]').classList.contains('is-poster'), img: document.querySelector('[data-case-cover] img').naturalWidth }));
    check('case page fills from embedded data and shows its cover', caseState.title.includes('도시') && caseState.poster && caseState.img > 0, caseState);

    // in-page links move inside the preview
    await page.evaluate(() => document.querySelector('[data-go="/"]').click()); await ready('[data-story].st-ready');
    await frame().locator('.site-header a[href="/team/"]').first().click();
    await ready('[data-sub="team"].st-ready');
    check('header menu link inside the page navigates in the preview', (await page.locator('#pv-url').textContent()) === '/team/' && (await page.locator('#pv-menu [aria-current=true]').textContent()) === 'TEAM');
    await page.locator('#pv-back').click(); await ready('[data-story].st-ready');
    check('back button returns to the previous page', (await page.locator('#pv-url').textContent()) === '/');
    await frame().locator('a[href="/works/#hospital"]').first().evaluate(a => a.click()).catch(() => {});
    if ((await page.locator('#pv-url').textContent()) !== '/works/#hospital') { await page.evaluate(() => { const f = document.querySelector('#pv-iframe').contentDocument; const a = f.createElement('a'); a.href = '/works/#hospital'; f.body.append(a); a.click(); }); }
    await ready('[data-sub="works"].st-ready'); await page.waitForTimeout(1500);
    check('deep link selects the service on WORKS', await inner().evaluate(() => document.querySelector('.sb-svc[aria-pressed=true]')?.dataset.id === 'hospital'));
    await inner().evaluate(() => document.getElementById('projects').scrollIntoView()); await page.waitForTimeout(1500);
    check('WORKS project list renders from embedded data', await inner().evaluate(() => document.querySelectorAll('[data-project-list] .shot-frame img').length >= 6 && [...document.querySelectorAll('[data-project-list] .shot-frame img')].slice(0, 4).every(i => i.naturalWidth > 0)));
    await page.screenshot({ path: path.join(out, 'shell-works.png') });

    // contact form submits to the preview stub
    await page.evaluate(() => document.querySelector('[data-go="/contact/"]').click()); await ready('[data-sub="contact"].st-ready');
    const f = inner();
    await f.evaluate(() => { const form = document.getElementById('inquiry-form'); form.querySelector('[name=services][value=strategy]').checked = true; for (const [k, v] of Object.entries({ company: '미리보기 테스트', name: '홍길동', phone: '010-0000-0000', email: 'test@example.com', message: '미리보기 전송 동작을 확인합니다.' })) form.elements[k].value = v; form.querySelector('[name=consent]').checked = true; });
    await f.locator('#inquiry-form [type=submit]').click(); await page.waitForTimeout(1500);
    const status = await f.evaluate(() => document.getElementById('form-status').textContent);
    check('contact form completes against the preview stub', /PREVIEW-/.test(status), status);
    check('preview tells the visitor nothing was sent', /실제로 전송되지 않았습니다/.test(await page.locator('#pv-toast').textContent()));

    // device sizes
    for (const [label, w] of [['모바일', 390], ['노트북', 1180], ['PC', 1440]]) {
      await page.locator('#pv-device button', { hasText: label }).click(); await page.waitForTimeout(900);
      const iw = await inner().evaluate(() => innerWidth);
      check(`${label} size gives the page a ${w}px viewport`, iw === w, iw);
      if (w === 390) { await page.evaluate(() => document.querySelector('[data-go="/"]').click()); await ready('[data-story].st-ready'); await page.screenshot({ path: path.join(out, 'shell-mobile.png') }); }
    }
    await page.locator('#pv-list-btn').click(); await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, 'shell-list.png') });
    check('no errors inside the preview', errors.length === 0, errors.slice(0, 5));
  } finally { await browser.close(); }
  const failed = results.filter(x => !x.pass);
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
