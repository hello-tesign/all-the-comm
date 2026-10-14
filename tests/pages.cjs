/* Playwright QA for the Korean subpages (ABOUT · PROCESS · TEAM · WORKS · CONTACT).
   Usage: start an isolated server with the portfolio imported (see tests/story.cjs), then
   `TEST_URL=http://127.0.0.1:4183 npm run test:pages`. Optional PW_CHROMIUM_PATH. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4183');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Pages QA only accepts a loopback test server.');
if (base.port === '4173') throw new Error('Port 4173 is the user preview. Use an isolated QA server.');
const origin = base.origin;
const out = path.resolve(__dirname, '../qa/pages-2026-10-14');
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, pass, detail = null) => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass || detail === null ? '' : ' — ' + JSON.stringify(detail)}`); };
const pages = ['about', 'process', 'team', 'works', 'contact'];
const watch = page => { const e = []; page.on('pageerror', x => e.push(x.message)); page.on('console', m => { if (m.type() === 'error') e.push(m.text()); }); page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) e.push(r.status() + ' ' + r.url()); }); return e; };
const slowScroll = page => page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } });
const textOverflow = page => page.evaluate(() => [...document.querySelectorAll('[data-sub] :is(h1,h2,h3,p,b,a,button,th,td,li,small,span,dd,dt,summary)')]
  .filter(e => !e.closest('.st-mark,.st-reel') && e.getClientRects().length)
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); })
  .map(e => (e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 24)).slice(0, 6));

(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
  try {
    for (const [w, h, tag] of [[1440, 900, 'desktop'], [1180, 760, 'laptop'], [390, 844, 'mobile']]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...(tag === 'mobile' ? { isMobile: true, hasTouch: true } : {}) });
      for (const name of pages) {
        const page = await ctx.newPage(); const errors = watch(page);
        const res = await page.goto(`${origin}/${name}/`, { waitUntil: 'networkidle' });
        await page.waitForSelector('[data-sub].st-ready', { timeout: 8000 });
        await page.waitForTimeout(1300);
        const h1 = await page.evaluate(() => { const h = document.querySelector('h1'); const r = h.getBoundingClientRect(); const words = [...h.querySelectorAll('.st-line>span')].map(s => s.getBoundingClientRect()); return { n: document.querySelectorAll('h1').length, top: r.top, visible: r.height > 40 && words.every(b => b.top >= r.top - 2 && b.bottom <= r.bottom + 12) }; });
        check(`${tag} ${name}: loads with the new layout`, res.status() === 200 && (await page.locator('link[href="/sub.css"]').count()) === 1);
        check(`${tag} ${name}: one h1, fully drawn within 1.3s`, h1.n === 1 && h1.visible, h1);
        if (tag === 'desktop') await page.screenshot({ path: path.join(out, `${tag}-${name}-hero.png`) });
        await slowScroll(page); await page.waitForTimeout(900);
        const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-sub] .st-rv:not(.in),[data-sub] [data-st-words]:not(.in)')].length);
        check(`${tag} ${name}: every reveal fires while scrolling`, hidden === 0, hidden);
        check(`${tag} ${name}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const over = await textOverflow(page);
        check(`${tag} ${name}: no text runs off screen`, over.length === 0, over);
        const anchors = await page.evaluate(() => [...document.querySelectorAll('.sb-index a')].map(a => a.getAttribute('href')).filter(h => !document.querySelector(h)));
        check(`${tag} ${name}: page index anchors resolve`, anchors.length === 0, anchors);
        if (name === 'about' || name === 'team') check(`${tag} ${name}: no work-case section`, await page.evaluate(() => !document.querySelector('#about-work,#team-work,.sb-board')));
        check(`${tag} ${name}: no images broken`, await page.evaluate(() => [...document.querySelectorAll('[data-sub] img')].filter(i => i.complete && i.getClientRects().length && !i.naturalWidth).length === 0));
        if (tag !== 'laptop') {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(out, `${tag}-${name}.png`), fullPage: true });
        }
        check(`${tag} ${name}: no console/network errors`, errors.length === 0, errors);
        await page.close();
      }
      await ctx.close();
    }

    // ---------- interactions (desktop) ----------
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); const errors = watch(page);
    // PROCESS rail
    await page.goto(origin + '/process/', { waitUntil: 'networkidle' }); await page.waitForSelector('[data-sub].st-ready');
    await page.locator('.sb-step').nth(2).scrollIntoViewIfNeeded(); await page.evaluate(() => { const s = document.querySelectorAll('.sb-step')[2]; scrollTo({ top: s.getBoundingClientRect().top + scrollY - innerHeight * .3, behavior: 'instant' }); }); await page.waitForTimeout(700);
    check('process: rail follows the step in view', (await page.locator('[data-sb-step]').textContent()) === '03' && (await page.locator('.sb-rail-sticky li.on').textContent()) === '실행');
    await page.screenshot({ path: path.join(out, 'process-rail.png') });
    // TEAM roles + matrix
    await page.goto(origin + '/team/', { waitUntil: 'networkidle' }); await page.waitForSelector('[data-sub].st-ready');
    check('team: hero orbit holds nine roles around one centre', await page.evaluate(() => { const core = document.querySelector('.sb-orbit-core'), c = core.getBoundingClientRect(), t = core.querySelector('span').getBoundingClientRect(); return document.querySelectorAll('.sb-orbit>span').length === 9 && t.left >= c.left && t.right <= c.right && t.top >= c.top && t.bottom <= c.bottom; }));
    check('team: five people with portraits, the CEO named', await page.evaluate(() => { const li = [...document.querySelectorAll('.sb-people li')]; return li.length === 5 && li.every(l => { const i = l.querySelector('img'); return i && i.complete && i.naturalWidth > 0; }) && /김연환/.test(li[0].textContent); }));
    check('team: nine role cards, each with an icon', (await page.locator('.sb-role').count()) === 9 && await page.evaluate(() => [...document.querySelectorAll('.sb-role')].every(r => r.querySelector('.sb-role-ic svg'))));
    check('team: every card shows a thumbnail or an icon tile', await page.evaluate(() => [...document.querySelectorAll('.sb-role-media')].every(m => m.querySelector('img,svg') && m.getBoundingClientRect().height > 80) && document.querySelectorAll('.sb-role-media img').length >= 4));
    check('team: roles link to their WORKS service instead of repeating it', await page.evaluate(() => [...document.querySelectorAll('.sb-role a')].every(a => /^\/works\/#[a-z]+$/.test(a.getAttribute('href')))));
    check('team: composition matrix 4 × 9', (await page.locator('.sb-matrix tbody tr').count()) === 4 && (await page.locator('.sb-matrix tbody tr:first-child td').count()) === 9);
    await page.locator('#team-roles').screenshot({ path: path.join(out, 'team-roles.png') });
    // WORKS services index + projects
    await page.goto(origin + '/works/', { waitUntil: 'networkidle' }); await page.waitForSelector('[data-sub].st-ready');
    check('works: ten services in the index', (await page.locator('.sb-svc').count()) === 10);
    await page.locator('.sb-svc[data-id="media"]').hover(); await page.waitForTimeout(300);
    check('works: hovering a service swaps the preview', await page.evaluate(() => { const v = [...document.querySelectorAll('.sb-svc-panel .sb-svc-detail')].filter(d => !d.hidden); return v.length === 1 && v[0].dataset.for === 'media'; }));
    await page.locator('#services').screenshot({ path: path.join(out, 'works-services.png') });
    await page.locator('#projects').scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
    check('works: project cards are filled with the work', await page.evaluate(() => { const v = [...document.querySelectorAll('[data-project-list] .pf-visual')]; return v.length >= 6 && v.every(x => x.querySelector('img')) && document.querySelector('[data-project-list] .pf-card.is-feature') && document.querySelector('[data-project-list] .pf-visual.is-series'); }));
    await page.locator('#clients').scrollIntoViewIfNeeded(); await page.evaluate(async () => { for (const i of document.querySelectorAll('#clients img')) { i.loading = 'eager'; } await new Promise(r => setTimeout(r, 1500)); });
    check('works: 32 clients in three groups, logos loaded and named', await page.evaluate(() => { const imgs = [...document.querySelectorAll('#clients .sb-client-grid img')]; return document.querySelectorAll('#clients .sb-client-group').length === 3 && document.querySelectorAll('#clients .sb-client-grid li').length === 32 && imgs.length >= 16 && imgs.every(i => i.alt.endsWith('로고') && i.complete && i.naturalWidth > 0); }));
    const deep = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await deep.goto(origin + '/works/#hospital', { waitUntil: 'networkidle' }); await deep.waitForTimeout(1500);
    check('works: deep link selects the service', await deep.evaluate(() => document.querySelector('.sb-svc[aria-pressed=true]')?.dataset.id === 'hospital' && Math.abs(document.getElementById('services').getBoundingClientRect().top) < 140));
    await deep.close();
    // CONTACT
    await page.goto(origin + '/contact/?services=strategy,pr', { waitUntil: 'networkidle' }); await page.waitForSelector('[data-sub].st-ready');
    check('contact: form intact and prefilled', await page.evaluate(() => !!document.querySelector('#inquiry-form [name=company]') && [...document.querySelectorAll('[name=services]:checked')].map(i => i.value).join() === 'strategy,pr'));
    check('contact: mail and phone channels', (await page.locator('.sb-channel[href^="mailto:"]').count()) === 1 && (await page.locator('.sb-channel[href^="tel:"]').count()) === 1);
    await page.locator('.sb-faq summary').nth(1).click(); await page.waitForTimeout(300);
    check('contact: one FAQ answer open at a time', await page.evaluate(() => { const d = [...document.querySelectorAll('.sb-faq details')]; return d[1].open && d.filter(x => x.open).length === 1; }));
    await page.locator('#inquiry-form [type=submit]').click(); await page.waitForTimeout(300);
    check('contact: empty submit is blocked by validation', await page.evaluate(() => !document.querySelector('#inquiry-form').checkValidity()));
    // links
    const links = new Set();
    for (const name of pages) { await page.goto(`${origin}/${name}/`, { waitUntil: 'domcontentloaded' }); (await page.evaluate(() => [...document.querySelectorAll('[data-sub] a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0]))).forEach(l => links.add(l)); }
    const bad = [];
    for (const l of links) { const r = await page.request.get(origin + l); if (r.status() >= 400) bad.push(l + ' ' + r.status()); }
    check(`links: every subpage link resolves (${links.size})`, bad.length === 0, bad);
    check('interactions: no errors', errors.length === 0, errors);
    await page.close();

    // ---------- mobile interactions ----------
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const m = await mctx.newPage();
    await m.goto(origin + '/works/', { waitUntil: 'networkidle' }); await m.waitForSelector('[data-sub].st-ready');
    await m.locator('.sb-svc[data-id="it"]').tap(); await m.waitForTimeout(400);
    check('mobile works: tapping a service opens its detail inline', await m.evaluate(() => { const li = document.getElementById('svc-it'); return li.classList.contains('is-open') && getComputedStyle(li.querySelector('.sb-svc-inline')).display === 'block'; }));
    await m.goto(origin + '/team/', { waitUntil: 'networkidle' });
    check('mobile team: matrix stacks into chips', await m.evaluate(() => getComputedStyle(document.querySelector('.sb-matrix thead')).display === 'none'));
    await mctx.close();

    // ---------- reduced motion + EN untouched ----------
    const r = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    for (const name of pages) {
      await r.goto(`${origin}/${name}/`, { waitUntil: 'networkidle' }); await r.waitForSelector('[data-sub].st-ready');
      check(`reduced ${name}: headings visible immediately`, await r.evaluate(() => { const s = document.querySelector('.sb-title .st-line>span'); return getComputedStyle(s).animationName === 'none' || getComputedStyle(s).transform === 'none'; }));
    }
    for (const name of pages) {
      await r.goto(`${origin}/en/${name}/`, { waitUntil: 'networkidle' });
      check(`en ${name}: English page unchanged`, (await r.locator('[data-sub]').count()) === 0 && (await r.locator('link[href="/sub.css"]').count()) === 0);
    }
    await r.close();
  } finally { await browser.close(); }

  const failed = results.filter(x => !x.pass);
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ at: new Date().toISOString(), origin, total: results.length, failed: failed.length, results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed · screenshots: qa/pages-2026-10-14/`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
