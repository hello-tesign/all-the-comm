const { chromium, firefox, webkit } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

// Read-only public UI verification. All writes, including enquiry submissions,
// are blocked at the browser boundary. No production/private store is opened.
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const out = path.resolve('qa/isos-2026-10-12/final');
const routes = [
  ['home', '/'], ['about', '/about/'], ['process', '/process/'],
  ['team', '/team/'], ['works', '/works/'], ['contact', '/contact/'],
  ['privacy', '/privacy/'], ['case', '/works/project/sojukdoo-concept/'],
];
const checks = [], errors = [], blockedWrites = [], pageRecords = [];
let activePage, activeLabel;
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
function check(name, passed, detail) {
  checks.push({ name, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) });
  if (!passed) console.error('FAIL ' + name + (detail === undefined ? '' : ': ' + JSON.stringify(detail)));
}
async function until(page, predicate, arg, timeout = 5000) {
  return page.waitForFunction(predicate, arg, { timeout }).then(() => true).catch(() => false);
}
async function sourceTitles(page, url) {
  const response = await page.request.get(base + url);
  const html = await response.text();
  return page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      h1: doc.querySelector('main h1')?.textContent,
      h2: [...doc.querySelectorAll('main h2')].map(el => el.textContent),
      processCopy: [...doc.querySelectorAll('.chapter-copy')].map(el => el.textContent),
    };
  }, html);
}
async function top(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
async function completeImages(page, selector) {
  for (const image of await page.locator(selector).all()) {
    await image.scrollIntoViewIfNeeded();
    const loaded = await until(page, el => el.complete && el.naturalWidth > 0, await image.elementHandle());
    if (!loaded) return false;
    await image.evaluate(el => el.decode());
  }
  return true;
}
async function tabs(page, label, stageSelector, expected) {
  const stage = page.locator(stageSelector), buttons = stage.locator('[role=tab]');
  check(label + ' expected tab count', await buttons.count() === expected);
  const state = () => stage.evaluate(el => {
    const selected = [...el.querySelectorAll('[role=tab]')].filter(x => x.getAttribute('aria-selected') === 'true');
    const visible = [...el.querySelectorAll('[role=tabpanel]')].filter(x => !x.hidden && x.checkVisibility());
    return { selected: selected.length, visible: visible.length,
      paired: selected[0]?.getAttribute('aria-controls') === visible[0]?.id,
      focus: selected[0] === document.activeElement };
  });
  await buttons.nth(1).click();
  let value = await state();
  check(label + ' click selects exactly one matching visible panel', value.selected === 1 && value.visible === 1 && value.paired, value);
  await buttons.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  value = await state();
  check(label + ' arrow key moves selection and focus', value.selected === 1 && value.visible === 1 && value.paired && value.focus && await buttons.nth(2).getAttribute('aria-selected') === 'true', value);
  await page.keyboard.press('End');
  check(label + ' End selects last tab', await buttons.last().getAttribute('aria-selected') === 'true');
  await page.keyboard.press('Home');
  check(label + ' Home restores first tab', await buttons.first().getAttribute('aria-selected') === 'true');
}
async function processFlow(page, label, original) {
  const section = page.locator('.process-chapters');
  check(label + ' four original narrative chapters', await page.locator('.process-narrative > .process-chapter').count() === 4);
  check(label + ' four accessible step links', await page.locator('.process-cinema-nav a').count() === 4);
  check(label + ' four art scenes in one sticky cinema', await page.locator('.process-cinema-art > .chapter-art').count() === 4 && await page.locator('.process-cinema').evaluate(el => getComputedStyle(el).position) === 'sticky');
  check(label + ' process copy preserved', JSON.stringify((await page.locator('.chapter-copy').allTextContents()).map(clean)) === JSON.stringify(original.processCopy.map(clean)));
  for (let step = 1; step <= 4; step++) {
    await page.locator('#step-' + step).evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - innerHeight * .3, behavior: 'instant' }));
    const active = await until(page, n => document.querySelector('.process-chapters')?.dataset.activeStep === String(n), step);
    const marks = await page.locator('.process-cinema-nav a[aria-current=step]').allTextContents();
    check(label + ' scroll activates step ' + step, active && marks.length === 1 && await page.locator('.process-cinema-nav a[aria-current=step]').getAttribute('href') === '#step-' + step, { active, marks });
  }
  await page.locator('.process-cinema-nav a[href="#step-2"]').click();
  check(label + ' cinema link navigates to step 2', await until(page, () => location.hash === '#step-2' && document.querySelector('.process-chapters')?.dataset.activeStep === '2'));
  const stickyTop = await page.locator('.process-cinema').evaluate(el => el.getBoundingClientRect().top);
  await page.evaluate(() => window.scrollBy({ top: 100, behavior: 'instant' }));
  await page.waitForTimeout(100);
  const movedTop = await page.locator('.process-cinema').evaluate(el => el.getBoundingClientRect().top);
  check(label + ' cinema remains pinned during native narrative scroll', Math.abs(stickyTop - movedTop) <= 2, { stickyTop, movedTop });
  await page.locator('.process-cinema').evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({ path: path.join(out, label.replaceAll(' ', '-') + '-cinema.png') });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const removed = await until(page, () => !document.documentElement.classList.contains('isos-motion-enabled') && !document.documentElement.classList.contains('isos-story-enabled') && !document.querySelector('.process-cinema'));
  check(label + ' live reduced motion removes both enhancements', removed);
  check(label + ' reduced motion restores original four art children', await page.locator('.process-chapters > .process-chapter > .chapter-art').count() === 4);
  check(label + ' reduced motion removes generated nav and reading lines', await page.locator('.process-cinema-nav,.site-reading-progress,.portfolio-reading-progress').count() === 0);
  check(label + ' reduced motion preserves original copy and title', JSON.stringify((await page.locator('.chapter-copy').allTextContents()).map(clean)) === JSON.stringify(original.processCopy.map(clean)) && clean(await page.locator('main h1').textContent()) === clean(original.h1));
  check(label + ' reduced motion unwraps title words', await page.locator('[data-isos-word]').count() === 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check(label + ' restoring motion mounts exactly one cinema and line', await until(page, () => document.documentElement.classList.contains('isos-motion-enabled') && document.documentElement.classList.contains('isos-story-enabled') && document.querySelectorAll('.process-cinema').length === 1 && document.querySelectorAll('.site-reading-progress').length === 1));
  check(label + ' restoring motion preserves four chapters and four art scenes', await page.locator('.process-narrative > .process-chapter').count() === 4 && await page.locator('.process-cinema-art > .chapter-art').count() === 4);
}
async function exclusions(context, engineName) {
  const page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => errors.push({ engine: engineName, route: page.url(), message: error.message }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/process/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  check(engineName + ' mobile branch excludes desktop enhancements', await page.evaluate(() => !document.documentElement.classList.contains('isos-motion-enabled') && !document.documentElement.classList.contains('isos-story-enabled') && !document.querySelector('.site-reading-progress,.process-cinema,[data-isos-word]')));
  check(engineName + ' mobile retains all four original process arts', await page.locator('.process-chapters > .process-chapter > .chapter-art').count() === 4);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/en/process/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  check(engineName + ' English branch excludes Korean enhancements', await page.evaluate(() => document.documentElement.lang === 'en' && !document.documentElement.classList.contains('isos-motion-enabled') && !document.documentElement.classList.contains('isos-story-enabled') && !document.querySelector('.site-reading-progress,.process-cinema,[data-isos-word]')));
  check(engineName + ' English retains all four original process arts', await page.locator('.process-chapters > .process-chapter > .chapter-art').count() === 4);
  await page.close();
}
async function run() {
  await fs.mkdir(out, { recursive: true });
  const wanted = new Set((process.env.TEST_BROWSERS || 'chromium,firefox,webkit').split(','));
  for (const [engineName, engine] of Object.entries({ chromium, firefox, webkit })) {
    if (!wanted.has(engineName)) continue;
    activeLabel = engineName + ' browser startup';
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', locale: 'ko-KR' });
      await context.route('**/*', route => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.continue();
        blockedWrites.push({ engine: engineName, method: route.request().method(), url: route.request().url() });
        return route.abort();
      });
      const page = await context.newPage();
      activePage = page;
      page.on('pageerror', error => errors.push({ engine: engineName, route: page.url(), message: error.message }));
      for (const [name, url] of routes) {
        const label = engineName + ' ' + name;
        activeLabel = label;
        try {
          const response = await page.goto(base + url, { waitUntil: 'load' });
          await page.waitForTimeout(1500);
          const original = await sourceTitles(page, url);
          check(label + ' HTTP 200', response.status() === 200);
          check(label + ' original h1 text preserved', clean(await page.locator('main h1').textContent()) === clean(original.h1));
          check(label + ' original h2 text preserved', JSON.stringify((await page.locator('main h2').allTextContents()).map(clean)) === JSON.stringify(original.h2.map(clean)));
          check(label + ' desktop modules enabled', await until(page, () => document.documentElement.classList.contains('isos-motion-enabled') && document.documentElement.classList.contains('isos-story-enabled')));
          check(label + ' one global reading line', await page.locator('.site-reading-progress').count() === 1);
          check(label + ' no duplicate visible reading line', await page.locator('.site-reading-progress,.portfolio-reading-progress').evaluateAll(elements => elements.filter(el => el.checkVisibility()).length) === 1);
          check(label + ' no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          const nav = await page.locator('.desktop-nav a').allTextContents();
          check(label + ' official five menu items preserved', JSON.stringify(nav.map(clean)) === JSON.stringify(['ABOUT US', 'OUR PROCESS', 'TEAM', 'WORKS', 'CONTACT']), nav);
          check(label + ' separate contact CTA preserved', await page.locator('.header-cta').count() === 1 && (await page.locator('.header-cta').getAttribute('href')) === '/contact/');
          check(label + ' heading has readable visible bounds', await page.locator('main h1').evaluate(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).opacity === '1'; }));
          await page.screenshot({ path: path.join(out, engineName + '-' + name + '.png') });
          if (name === 'home') {
            check(label + ' all three featured cards own portfolio motion', await until(page, () => document.querySelectorAll('[data-featured] .portfolio-piece.portfolio-motion-ready').length === 3));
            await tabs(page, label + ' services', '[data-capabilities]', 8);
          }
          if (name === 'team') await tabs(page, label, '[data-capabilities]', 9);
          if (name === 'works') await tabs(page, label, '[data-capabilities]', 10);
          if (name === 'process') await processFlow(page, label, original);
          if (name === 'contact') {
            const values = { company: '모션 확인용 가상 회사', name: '검수 담당', phone: '010-0000-0000', email: 'qa@example.test', message: '접수하지 않는 로컬 화면 검수입니다. 입력 내용 보존을 확인합니다.' };
            for (const [key, value] of Object.entries(values)) await page.locator('[name="' + key + '"]').fill(value);
            await page.locator('[name=services][value=it]').check();
            await page.locator('[name=services][value=content]').check();
            await page.locator('.footer-invitation').scrollIntoViewIfNeeded();
            check(label + ' input values remain after scrolling', (await Promise.all(Object.entries(values).map(async ([key, value]) => await page.locator('[name="' + key + '"]').inputValue() === value))).every(Boolean));
            check(label + ' multi-service selection remains intact', await page.locator('[name=services]:checked').count() === 2);
            check(label + ' no false submitted state', await page.locator('#form-status').textContent() === '');
          }
          if (name === 'case') {
            check(label + ' original capture images load after scrolling', await completeImages(page, '[data-case-cover] img,[data-case-gallery] img'));
          }
          await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
          check(label + ' global line follows native reading position', await until(page, () => { const line = document.querySelector('.site-reading-progress i'); return line && new DOMMatrixReadOnly(getComputedStyle(line).transform).a > .95; }));
          check(label + ' no horizontal overflow after scene transitions', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          pageRecords.push({ engine: engineName, name, url, status: response.status(), height: await page.evaluate(() => document.documentElement.scrollHeight) });
          console.log(label + ' checked');
        } catch (error) {
          check(label + ' flow completed', false, error.message);
          await page.screenshot({ path: path.join(out, engineName + '-' + name + '-failure.png') }).catch(() => {});
        }
      }
      await page.close();
      await exclusions(context, engineName);
      await context.close();
    } finally { await browser.close(); }
  }
  check('No runtime JavaScript errors', errors.length === 0, errors);
  check('No enquiry or other mutation was attempted', blockedWrites.length === 0, blockedWrites);
}
run().catch(async error => {
  check(activeLabel || 'Browser test startup', false, error.stack || error.message);
  if (activePage) await activePage.screenshot({ path: path.join(out, 'fatal.png') }).catch(() => {});
}).finally(async () => {
  const result = { date: new Date().toISOString(), scope: 'Korean PC 1440x1000, Chromium/Firefox/WebKit. Mobile and English exclusion only. GET-only UI checks; enquiries never submitted.', base, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length, checks, errors, blockedWrites, pages: pageRecords };
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: errors.length, blockedWrites: blockedWrites.length }));
  if (result.failed) process.exitCode = 1;
});
