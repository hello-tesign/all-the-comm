/* Playwright QA for the Korean HOME scroll story (desktop motion, mobile/reduced static, interaction, a11y basics, regressions).
   Usage: start an isolated server with the portfolio imported (PORT=4183 DATA_DIR=... npm start; npm run portfolio:import),
   then `TEST_URL=http://127.0.0.1:4183 npm run test:story`.
   Optional: PW_CHROMIUM_PATH=/path/to/chrome when the bundled browser revision is not installed. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4183');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Story QA only accepts a loopback test server.');
if (base.port === '4173') throw new Error('Port 4173 is the user preview. Use an isolated QA server.');
const origin = base.origin;
const out = path.resolve(__dirname, '../qa/story-2026-10-13');
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, pass, detail = null) => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass || detail === null ? '' : ' — ' + JSON.stringify(detail)}`); };

async function scrollToScene(page, id, p) {
  await page.evaluate(([id, p]) => {
    const el = document.getElementById(id); const top = el.getBoundingClientRect().top + scrollY;
    const tot = Math.max(0, el.offsetHeight - innerHeight); window.scrollTo({ top: top + tot * p, behavior: 'instant' });
  }, [id, p]);
  await page.waitForTimeout(500);
}
const watchErrors = page => { const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) errors.push(r.status() + ' ' + r.url()); }); return errors; };
// Text that runs off the screen edge (ignores intentionally scrolling strips).
const textOverflow = page => page.evaluate(() => [...document.querySelectorAll('[data-story] :is(h1,h2,h3,p,b,a,button,th,td,small,span)')]
  .filter(e => !e.closest('.sc-ring,.st-logo-rows,.st-reel,.st-hud,.st-hero-end,.st-mark,.st-wps') && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); })
  .map(e => e.className || e.textContent.slice(0, 30)).slice(0, 8));
const visibleText = (page, sel) => page.locator(sel).evaluateAll(els => els.filter(e => !e.hidden && e.getClientRects().length).map(e => e.textContent.trim()));

(async () => {
  const launch = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {};
  const browser = await chromium.launch(launch);
  try {
    // ---------- desktop motion ----------
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = watchErrors(page);
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-story].st-ready', { timeout: 8000 });
    await page.waitForTimeout(1400);
    check('desktop: story engine ready', true);
    check('desktop: single visible h1', await page.evaluate(() => { const h = [...document.querySelectorAll('h1')]; return h.length === 1 && h[0].getBoundingClientRect().height > 40; }));
    check('desktop: story stylesheet only on home', (await page.locator('link[href="/story.css"]').count()) === 1);
    await page.screenshot({ path: path.join(out, 'd-01-hero.png') });

    await scrollToScene(page, 'st-hero', .92);
    const heroEnd = await page.evaluate(() => +getComputedStyle(document.querySelector('.st-hero-end')).opacity);
    const covers = await page.evaluate(() => { const r = document.querySelector('.st-mark-window').getBoundingClientRect(); return r.left <= 0 && r.top <= 0 && r.right >= innerWidth && r.bottom >= innerHeight; });
    check('hero: logo window opens over the whole screen', covers);
    check('hero: closing line appears', heroEnd > .9, heroEnd);
    await page.screenshot({ path: path.join(out, 'd-01-hero-end.png') });

    await scrollToScene(page, 'st-why', 0);
    const s0 = await page.evaluate(() => document.querySelector('.st-pain-row').style.getPropertyValue('--s'));
    await scrollToScene(page, 'st-why', .45);
    await page.screenshot({ path: path.join(out, 'd-02-why-mid.png') });
    await scrollToScene(page, 'st-why', .98);
    const sa = await page.evaluate(() => [...document.querySelectorAll('.st-pain-row')].map(r => [r.style.getPropertyValue('--s'), r.style.getPropertyValue('--a')].join('/')));
    check('why: worries struck and answered in order', s0 === '0.000' && sa.every(v => v === '1.000/1.000'), { s0, sa });
    await page.screenshot({ path: path.join(out, 'd-02-why.png') });

    await scrollToScene(page, 'st-tangle', .4);
    const tangleA = await page.evaluate(() => ({ costs: [...document.querySelectorAll('.net-cost')].filter(g => +g.style.opacity > .5).length, b: document.getElementById('st-tangle').classList.contains('is-b') }));
    await page.screenshot({ path: path.join(out, 'd-03-tangle-a.png') });
    await scrollToScene(page, 'st-tangle', .96);
    const tangleB = await page.evaluate(() => ({ costs: [...document.querySelectorAll('.net-cost')].filter(g => +g.style.opacity > .05).length, b: document.getElementById('st-tangle').classList.contains('is-b'), hub: document.querySelector('.net-hub').getAttribute('transform'), vendor: document.querySelector('.net-node text').textContent }));
    check('tangle: six cost callouts while lines are crossed', tangleA.costs === 6 && !tangleA.b, tangleA);
    check('tangle: lines resolve through one team', tangleB.costs === 0 && tangleB.b && /scale\(1(\.000)?\)/.test(tangleB.hub) && tangleB.vendor === '디자인·콘텐츠', tangleB);
    await page.screenshot({ path: path.join(out, 'd-03-tangle-b.png') });

    await page.locator('#st-services').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    check('services: 8 selectable services in the sentence', (await page.locator('.st-word').count()) === 8);
    await page.locator('.st-word[data-id="strategy"]').click();
    await page.locator('.st-word[data-id="pr"]').click();
    const pickHref = await page.locator('[data-st-pick-go]').getAttribute('href');
    const shown = await visibleText(page, '.st-svc-row h3');
    check('services: picks carry into the enquiry link', pickHref === '/contact/?services=strategy,pr', pickHref);
    check('services: detail follows the chosen word', shown.length === 1 && shown[0] === '언론홍보', shown);
    await page.locator('.st-word[data-id="digital"]').hover(); await page.waitForTimeout(150);
    check('services: hover previews a service without selecting it', (await visibleText(page, '.st-svc-row h3'))[0] === '디지털 마케팅' && (await page.locator('.st-word[aria-pressed=true]').count()) === 2);
    await page.screenshot({ path: path.join(out, 'd-04-services.png') });

    await scrollToScene(page, 'st-case', .1);
    const w0 = await page.locator('[data-st-week]').textContent();
    await scrollToScene(page, 'st-case', .9);
    const w1 = await page.locator('[data-st-week]').textContent();
    check('case: project clock advances W+1 → W+12', w0 !== w1 && w1 === 'W+12', { w0, w1 });
    check('case: all route waypoints reached', (await page.locator('.st-wp.on').count()) === 5);
    check('case: sample case is labelled SAMPLE', (await page.locator('#st-case .st-tag').textContent()).startsWith('SAMPLE'));
    await page.screenshot({ path: path.join(out, 'd-05-case.png') });

    await scrollToScene(page, 'st-gallery', 0);
    const g0 = await page.evaluate(() => [...document.querySelectorAll('.sc-item')].findIndex(i => i.classList.contains('center')));
    await page.screenshot({ path: path.join(out, 'd-06-gallery-0.png') });
    await scrollToScene(page, 'st-gallery', .5);
    const g1 = await page.evaluate(() => ({ c: [...document.querySelectorAll('.sc-item')].findIndex(i => i.classList.contains('center')), cap: document.querySelector('[data-sc-title]').textContent }));
    const g1title = await page.evaluate(i => document.querySelectorAll('.sc-item .sc-back h3')[i].textContent, g1.c);
    check('gallery: brand work and live sites only, filling the card', await page.evaluate(() => { const items = [...document.querySelectorAll('.sc-item')]; return items.length === 10 && items.every(it => !/프로토타입|콘셉트/.test(it.querySelector('.sc-back small').textContent) && it.querySelector('.sc-front .sc-img')); }));
    check('gallery: corridor advances with scroll', g0 === 0 && g1.c >= 4 && g1.c <= 5 && g1.cap === g1title, { g0, g1, g1title });
    await page.screenshot({ path: path.join(out, 'd-06-gallery-mid.png') });
    const center = page.locator('.sc-item.center');
    await center.locator('.sc-turn').click(); await page.waitForTimeout(1000);
    const flipped = await page.evaluate(() => { const it = document.querySelector('.sc-item.center'); return { f: it.classList.contains('flipped'), focus: document.activeElement?.closest('.sc-back') !== null, link: document.activeElement?.getAttribute('href') }; });
    check('gallery: center card flips to reveal the project', flipped.f && flipped.focus && /^\/works\/project\//.test(flipped.link || ''), flipped);
    await page.screenshot({ path: path.join(out, 'd-06-gallery-flip.png') });
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
    check('gallery: Escape turns the card back', await page.evaluate(() => !document.querySelector('.sc-item.center').classList.contains('flipped') && document.activeElement?.classList.contains('sc-turn')));
    const before = await page.evaluate(() => scrollY);
    await page.locator('[data-sc-next]').click(); await page.waitForTimeout(1300);
    const g2 = await page.evaluate(() => [...document.querySelectorAll('.sc-item')].findIndex(i => i.classList.contains('center')));
    check('gallery: next control moves one work forward', (await page.evaluate(() => scrollY)) > before && g2 === g1.c + 1, { g2 });
    const sideIdx = g2 + 2;
    await page.locator('.sc-item').nth(sideIdx).locator('.sc-turn').evaluate(b => b.click()); await page.waitForTimeout(1500);
    check('gallery: choosing a side card brings it to the front', await page.evaluate(i => document.querySelectorAll('.sc-item')[i].classList.contains('center'), sideIdx));
    await page.locator('#st-clients').scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
    check('clients: 32 clients drift in two rows (logo or name), names listed once for screen readers', await page.evaluate(() => { const s = document.querySelector('#st-clients'), tiles = s.querySelectorAll('.st-logo:not([data-dup])'), logos = [...s.querySelectorAll('.st-logo:not([data-dup]) img')]; return s.querySelectorAll('.st-logo-row').length === 2 && tiles.length === 32 && logos.length >= 16 && s.querySelectorAll('.st-sr li').length === 32 && s.querySelector('.st-logo-rows').getAttribute('aria-hidden') === 'true' && getComputedStyle(s.querySelector('.st-logo-track')).animationName !== 'none' && logos.filter(i => i.getBoundingClientRect().right > 0 && i.getBoundingClientRect().left < innerWidth).every(i => i.complete && i.naturalWidth > 0); }));

    const cyc = [];
    for (const p of [.1, .35, .6, .9]) { await scrollToScene(page, 'st-cycle', p); cyc.push(await page.evaluate(() => [...document.querySelectorAll('.st-node')].findIndex(n => n.classList.contains('on')))); }
    check('cycle: active stage steps 0→3', JSON.stringify(cyc) === '[0,1,2,3]', cyc);
    await page.screenshot({ path: path.join(out, 'd-07-cycle.png') });

    await scrollToScene(page, 'st-mani', .25);
    const lit = await page.locator('.st-mani-words span.lit').count();
    await page.screenshot({ path: path.join(out, 'd-08-mani-a.png') });
    await scrollToScene(page, 'st-mani', .85);
    const fill = await page.evaluate(() => { const r = document.querySelector('.st-mani-mark').getBoundingClientRect(); return r.left <= 0 && r.right >= innerWidth && r.top <= 0 && r.bottom >= innerHeight; });
    check('manifesto: words light, then the mark fills the frame', lit >= 3 && fill, { lit, fill });
    await page.screenshot({ path: path.join(out, 'd-08-mani-b.png') });

    await page.locator('#st-nums').scrollIntoViewIfNeeded(); await page.waitForTimeout(1700);
    check('numbers: count-up lands on 10/9/4/1', (await page.locator('[data-st-count]').allTextContents()).join(',') === '10,9,4,1');
    await page.screenshot({ path: path.join(out, 'd-08-nums.png') });

    await page.locator('#st-compare table').scrollIntoViewIfNeeded(); await page.waitForTimeout(1400);
    const rowsVisible = await page.evaluate(() => [...document.querySelectorAll('.st-table tbody tr')].every(r => +getComputedStyle(r).opacity > .95));
    check('compare: 5 lenses × 3 ways, all rows revealed', (await page.locator('.st-table tbody tr').count()) === 5 && (await page.locator('.st-table .us').count()) === 6 && rowsVisible);
    await page.screenshot({ path: path.join(out, 'd-09-compare.png') });

    const lv = [];
    for (const p of [.1, .45, .9]) { await scrollToScene(page, 'st-grow', p); lv.push(await page.locator('.st-level.on').count() + '/' + await page.locator('.st-g.on').count()); }
    check('grow: engagement builds LV.1 → LV.3', lv.join() === '1/1,2/2,3/3', lv);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, 'd-10-grow.png') });

    await page.locator('#st-next').scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await page.locator('.st-asks a').nth(1).hover(); await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(out, 'd-11-next.png') });
    check('next: three ways to start, each to CONTACT', (await page.locator('.st-asks a[href^="/contact/"]').count()) === 3);
    check('desktop: chapter HUD tracks sections', (await page.locator('[data-st-chapn]').textContent()) === '11');
    check('desktop: HUD chip hides outside pinned scenes', await page.evaluate(() => !document.querySelector('.st-hud').classList.contains('on')));
    check('desktop: no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-story] a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0]))]);
    const bad = [];
    for (const l of links) { const r = await page.request.get(origin + l); if (r.status() >= 400) bad.push(l + ' ' + r.status()); }
    check(`links: every story link resolves (${links.length})`, bad.length === 0, bad);

    await page.goto(origin + pickHref, { waitUntil: 'networkidle' });
    const checked = await page.evaluate(() => [...document.querySelectorAll('[name=services]:checked')].map(i => i.value).join());
    check('contact: picked services arrive pre-selected', checked === 'strategy,pr', checked);
    check('desktop: no console/page/network errors', errors.length === 0, errors);
    await page.close();

    // ---------- narrower laptop ----------
    const lap = await browser.newPage({ viewport: { width: 1180, height: 760 } });
    await lap.goto(origin + '/', { waitUntil: 'networkidle' }); await lap.waitForSelector('[data-story].st-ready');
    const lapOver = [];
    for (const id of ['st-hero', 'st-why', 'st-tangle', 'st-case', 'st-gallery', 'st-cycle', 'st-grow']) { await scrollToScene(lap, id, .5); lapOver.push(...await textOverflow(lap)); }
    check('laptop 1180×760: no text runs off screen', lapOver.length === 0, lapOver);
    await scrollToScene(lap, 'st-why', .98);
    check('laptop: all three worries fit the pinned frame', await lap.evaluate(() => document.querySelector('.st-pains').getBoundingClientRect().bottom <= innerHeight));
    await lap.screenshot({ path: path.join(out, 'l-02-why.png') });
    await scrollToScene(lap, 'st-tangle', .3);
    check('laptop: tangle diagram fits under its title', await lap.evaluate(() => { const h = document.querySelector('.st-tangle-head').getBoundingClientRect(), n = document.querySelector('.st-net').getBoundingClientRect(); return n.top >= h.bottom - 1 && n.height > 260; }));
    await lap.screenshot({ path: path.join(out, 'l-03-tangle.png') });
    await scrollToScene(lap, 'st-gallery', .3);
    await lap.screenshot({ path: path.join(out, 'l-06-gallery.png') });
    await lap.close();

    // ---------- mobile static ----------
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const m = await ctx.newPage(); const mErrors = watchErrors(m);
    await m.goto(origin + '/', { waitUntil: 'networkidle' });
    await m.waitForSelector('[data-story].st-ready');
    await m.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 160)); } });
    await m.waitForTimeout(1600);
    const hiddenReveal = await m.evaluate(() => [...document.querySelectorAll('.st-rv:not(.in),[data-st-words]:not(.in)')].map(e => e.className || e.tagName));
    check('mobile: every reveal fires while scrolling', hiddenReveal.length === 0, hiddenReveal);
    check('mobile: count-up finished', (await m.locator('[data-st-count]').allTextContents()).join(',') === '10,9,4,1');
    check('mobile: no horizontal overflow', await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), await m.evaluate(() => document.documentElement.scrollWidth));
    const mOver = await textOverflow(m);
    check('mobile: no text runs off screen', mOver.length === 0, mOver);
    check('mobile: pinned scenes collapse to normal flow', await m.evaluate(() => [...document.querySelectorAll('.st-sticky')].every(s => getComputedStyle(s).position === 'relative')));
    check('mobile: tangle redraws vertically', await m.evaluate(() => document.querySelector('[data-st-net]').getAttribute('viewBox') === '0 0 600 900' && document.getElementById('st-tangle').classList.contains('is-b')));
    check('mobile: beats, panes, levels visible', await m.evaluate(() => [...document.querySelectorAll('.st-beat,.st-pane,.st-level,.st-g')].every(e => +getComputedStyle(e).opacity > .95)));
    check('mobile: beats stacked without overlap', await m.evaluate(() => { const b = [...document.querySelectorAll('.st-beat')].map(e => e.getBoundingClientRect()); return b.every((r, i) => !i || r.top >= b[i - 1].bottom - 1); }));
    check('mobile: gallery scrolls sideways', await m.evaluate(() => { const t = document.querySelector('.sc-ring'); return getComputedStyle(t).overflowX === 'auto' && t.scrollWidth > t.clientWidth; }));
    check('mobile: comparison table stacks', await m.evaluate(() => getComputedStyle(document.querySelector('.st-table thead')).display === 'none'));
    await m.locator('.sc-item').nth(1).scrollIntoViewIfNeeded();
    await m.locator('.sc-item').nth(1).locator('.sc-turn').tap(); await m.waitForTimeout(1000);
    check('mobile: tap flips a work card', await m.evaluate(() => document.querySelectorAll('.sc-item')[1].classList.contains('flipped')));
    await m.locator('.sc-item').nth(1).screenshot({ path: path.join(out, 'm-06-flip.png') });
    await m.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await m.waitForTimeout(300);
    await m.screenshot({ path: path.join(out, 'm-full.png'), fullPage: true });
    check('mobile: no errors', mErrors.length === 0, mErrors);
    await ctx.close();

    // ---------- reduced motion ----------
    const r = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const rErrors = watchErrors(r);
    await r.goto(origin + '/', { waitUntil: 'networkidle' });
    await r.waitForSelector('[data-story].st-ready');
    check('reduced: no sticky scenes', await r.evaluate(() => [...document.querySelectorAll('.st-sticky')].every(s => getComputedStyle(s).position === 'relative')));
    check('reduced: content fully visible without scrolling into it', await r.evaluate(() => [...document.querySelectorAll('.st-rv,.st-beat,.st-pane,.st-level,.st-table tbody tr')].every(e => +getComputedStyle(e).opacity > .95)));
    check('reduced: no horizontal overflow', await r.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const rOver = await textOverflow(r);
    check('reduced: no text runs off screen', rOver.length === 0, rOver);
    await r.screenshot({ path: path.join(out, 'r-full.png'), fullPage: true });
    check('reduced: no errors', rErrors.length === 0, rErrors);
    await r.close();

    // ---------- regressions on other pages ----------
    const g = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const gErrors = watchErrors(g);
    for (const u of ['/about/', '/process/', '/team/', '/works/', '/contact/', '/en/']) {
      const res = await g.goto(origin + u, { waitUntil: 'networkidle' });
      check(`regression: ${u} loads without the home scroll engine`, res.status() === 200 && (await g.locator('[data-story]').count()) === 0);
    }
    // case presentation boards
    await g.goto(origin + '/works/', { waitUntil: 'networkidle' });
    await g.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } });
    await g.waitForTimeout(800);
    const boards = await g.evaluate(() => [...document.querySelectorAll('.portfolio-piece[data-project-slug]')].map(c => { const v = c.querySelector('.pf-visual'), shown = [...(v?.querySelectorAll('img') || [])].filter(i => getComputedStyle(i).display !== 'none'); return { slug: c.dataset.projectSlug, imgs: shown.length, series: !!v?.classList.contains('is-series'), fill: shown.every(i => i.getBoundingClientRect().height >= v.getBoundingClientRect().height - 2 || v.classList.contains('is-tall')) }; }));
    check('works: every card is filled with its work', boards.length >= 6 && boards.every(b => b.imgs >= 1 && b.fill), boards);
    check('works: series show several pieces, single screens fill alone', boards.filter(b => ['eyewear-campaign', 'sales-rehearsal'].includes(b.slug)).every(b => b.series && b.imgs >= 2) && boards.filter(b => ['kings-franchise', 'soulreset', 'jonghae-community'].includes(b.slug)).every(b => !b.series && b.imgs === 1), boards);
    check('works: service previews show the work', await g.evaluate(() => document.querySelectorAll('.sb-svc-panel .sb-board.is-series').length === 4 && document.querySelectorAll('.sb-svc-panel .sb-board .sb-chrome').length === 2));
    await g.locator('.portfolio-piece').first().scrollIntoViewIfNeeded();
    await g.locator('.portfolio-piece').first().screenshot({ path: path.join(out, 'works-card.png') });
    for (const [slug, poster] of [['soulreset', false], ['city-culture', true]]) {
      await g.goto(origin + '/works/project/' + slug + '/', { waitUntil: 'networkidle' }); await g.waitForTimeout(600);
      check(`case ${slug}: cover ${poster ? 'staged as poster' : 'in browser frame'}`, (await g.evaluate(() => document.querySelector('[data-case-cover]').classList.contains('is-poster'))) === poster);
    }
    await g.goto(origin + '/contact/', { waitUntil: 'networkidle' });
    check('contact: 소적두 appears only in WORKS', !(await g.evaluate(() => document.body.innerText.includes('소적두'))));
    check('regression: no errors on other pages', gErrors.length === 0, gErrors);
    await g.close();
  } finally { await browser.close(); }

  const failed = results.filter(x => !x.pass);
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ at: new Date().toISOString(), origin, total: results.length, failed: failed.length, results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed · screenshots: qa/story-2026-10-13/`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
