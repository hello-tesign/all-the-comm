/* Browser QA for the approved renewal. No browser mutation reaches a backend. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let pw;
try { pw = require('playwright'); }
catch { pw = require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4183');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Renewal UI QA only accepts a loopback test server.');
if (base.port === '4173') throw new Error('Port 4173 is the user preview. Start the isolated QA server on 4183; browser QA will not use 4173.');
const origin = base.origin;
const out = path.resolve(__dirname, '../qa/renewal-2026-10-12/browser');
const primary = ['/', '/about/', '/process/', '/team/', '/works/', '/contact/', '/privacy/'];
const projectRoute = process.env.TEST_PROJECT_PATH || '/works/project/all-the-comm/';
const routes = [...primary, projectRoute, ...primary.map(r => '/en' + r), '/en' + projectRoute];
const menuPages = ['/about/', '/process/', '/team/', '/works/', '/contact/'];
const engines = (process.env.TEST_BROWSERS || 'chromium,firefox,webkit').split(',');
const motionOnly = process.env.TEST_SCOPE === 'motion';
const results = [], failures = [], requests = [], browserMessages = [];
const startedAt = new Date().toISOString();
fs.mkdirSync(out, { recursive: true });

function ensure(condition, detail) { if (!condition) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail)); }
function record(name, pass, detail = null) {
  const item = { name, pass, detail };
  results.push(item);
  if (!pass) { failures.push(item); console.error('FAIL ' + name + ': ' + (typeof detail === 'string' ? detail : JSON.stringify(detail))); }
}
async function test(name, run, page) {
  try { const detail = await run(); record(name, true, detail ?? null); }
  catch (error) {
    record(name, false, String(error.stack || error));
    if (page && !page.isClosed()) {
      try { await page.screenshot({ path: path.join(out, 'failure-' + name.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 130) + '.png'), fullPage: true, timeout: 5000 }); }
      catch {}
    }
  }
}
const url = route => new URL(route, origin).href;
const languageOf = route => route.startsWith('/en/') ? 'en' : 'ko';
const counterpart = route => languageOf(route) === 'en' ? route.slice(3) || '/' : '/en' + route;
function filename(route) { return route === '/' ? 'ko-home' : route === '/en/' ? 'en-home' : route.slice(1, -1).replaceAll('/', '-'); }
const checksum = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

// Deliberately intercept every mutating request before it can leave the browser.
// Only a synthetic failure is fulfilled; successful inquiries are backend-agent QA.
async function guardedContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const writes = [], state = { mockFailure: false };
  await context.route('**/*', async route => {
    const request = route.request();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.continue();
    const item = { method: request.method(), url: request.url(), action: state.mockFailure ? 'fulfilled-503-in-browser' : 'aborted-in-browser' };
    writes.push(item); requests.push(item);
    if (state.mockFailure) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'QA simulated delivery failure. Please retry.', message: 'QA simulated delivery failure. Please retry.' }) });
    return route.abort('blockedbyclient');
  });
  return { context, writes, state };
}
function observe(page, label) {
  const errors = [];
  page.on('pageerror', error => { const item = { label, type: 'pageerror', message: error.message }; errors.push(item); browserMessages.push(item); });
  page.on('console', message => {
    if (message.type() === 'error') { const item = { label, type: 'console', message: message.text() }; errors.push(item); browserMessages.push(item); }
  });
  return errors;
}
async function ready(page, route) {
  const response = await page.goto(url(route), { waitUntil: 'load', timeout: 15000 });
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 5000))]));
  return response;
}
async function scanWholePage(page) {
  // Exercise lazy assets/reveal content without depending on fixed document height.
  await page.evaluate(async () => {
    const pause = ms => new Promise(r => setTimeout(r, ms));
    const height = Math.min(document.documentElement.scrollHeight, 50000);
    for (let y = 0; y < height; y += Math.max(500, innerHeight * .85)) { scrollTo({ top: y, behavior: 'instant' }); await pause(18); }
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(120);
}
async function visibleProjects(page) {
  return page.locator('[data-project-card]').evaluateAll(nodes => nodes.filter(n => !n.hidden && getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 0).map(n => n.getAttribute('data-project-card') || n.id || n.textContent.trim()).sort());
}
async function controlState(control) { return { selected: await control.getAttribute('aria-selected'), pressed: await control.getAttribute('aria-pressed') }; }
async function activePanel(page) {
  return page.locator('[data-service-panel]').evaluateAll(nodes => nodes.filter(n => !n.hidden && getComputedStyle(n).display !== 'none' && getComputedStyle(n).visibility !== 'hidden' && n.getBoundingClientRect().height > 0).map(n => ({ id: n.id, text: n.textContent.trim(), key: n.getAttribute('data-service-panel') })));
}
async function verifyServiceControl(page, control) {
  const state = await controlState(control);
  ensure(state.selected === 'true' || state.pressed === 'true', { issue: 'Service control must expose the active state', state });
  const panels = await activePanel(page);
  ensure(panels.length >= 1 && panels.some(p => p.text.length > 10), { issue: 'A readable service panel must remain visible', panels });
  const controlled = await control.getAttribute('aria-controls');
  if (controlled) ensure(panels.some(p => p.id === controlled), { issue: 'Selected service controls a hidden/missing panel', controlled, panels });
  return panels;
}
async function fillValidInquiry(page) {
  const form = page.locator('#inquiry-form');
  const values = { company: 'QA UI TEST — NOT A CUSTOMER', name: 'QA Synthetic Tester', phone: '01000000000', email: 'qa-ui@example.invalid', message: 'QA browser test only. The request is intercepted before the server and must not create an inquiry.', budget: 'QA only', schedule: 'QA only' };
  for (const [name, value] of Object.entries(values)) {
    const field = form.locator(`[name="${name}"]`);
    if (await field.count()) {
      const tag = await field.first().evaluate(e => e.tagName);
      if (tag === 'SELECT') {
        const option = await field.first().locator('option').evaluateAll(es => es.find(e => e.value && !e.disabled)?.value);
        if (option) await field.first().selectOption(option);
      } else await field.first().fill(value);
    } else ensure(['budget', 'schedule'].includes(name), 'Missing required inquiry field: ' + name);
  }
  const services = form.locator('[name="services"]');
  ensure(await services.count() > 0, 'Missing service selection');
  if (await services.first().evaluate(e => e.tagName === 'SELECT')) {
    const option = await services.first().locator('option').evaluateAll(es => es.find(e => e.value && !e.disabled)?.value);
    ensure(option, 'Service select has no usable options'); await services.first().selectOption(option);
  } else await services.first().check();
  await form.locator('[name="consent"]').check();
  return form;
}
async function formData(form) {
  return form.evaluate(el => [...new FormData(el)].filter(([k]) => ['company','name','phone','email','services','consent','message','budget','schedule'].includes(k)).map(([k,v]) => [k, String(v)]));
}

async function routeMatrix(browser, engine, width) {
  const label = `${engine}-${width}`;
  const { context, writes } = await guardedContext(browser, { viewport: { width, height: width < 760 ? 844 : 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(5000);
  const errors = observe(page, label);
  try {
    for (const route of routes) {
      const name = label + route;
      let response;
      await test(name + ' document', async () => {
        response = await ready(page, route);
        ensure(response && response.status() === 200, { status: response?.status(), route });
        ensure(new URL(page.url()).pathname === route, { issue: 'Route redirects away from its intended document', actual: page.url() });
      }, page);
      if (!response || response.status() !== 200) continue;
      await scanWholePage(page);
      await test(name + ' semantics and responsive layout', async () => {
        const facts = await page.evaluate(() => ({
          lang: document.documentElement.lang, title: document.title, h1: document.querySelectorAll('h1').length,
          main: document.querySelectorAll('main').length, nav: document.querySelectorAll('nav').length,
          overflow: document.documentElement.scrollWidth - innerWidth,
          emptyHeadings: [...document.querySelectorAll('h1,h2,h3')].filter(n => !n.textContent.trim()).length,
          broken: [...document.images].filter(i => getComputedStyle(i).display !== 'none' && i.complete && !i.naturalWidth).map(i => i.getAttribute('src')),
          missingAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src')),
          infiniteAnimations: document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length,
        }));
        ensure(facts.lang.startsWith(languageOf(route)), facts);
        ensure(facts.title.length > 5 && facts.h1 === 1 && facts.main === 1 && facts.nav >= 1 && facts.emptyHeadings === 0, facts);
        ensure(facts.overflow <= 1 && facts.broken.length === 0 && facts.missingAlt.length === 0, facts);
        ensure(facts.infiniteAnimations === 0, { issue: 'Reduced-motion page still runs an infinite animation', ...facts });
        return facts;
      }, page);
      await test(name + ' header and matching language link', async () => {
        const links = await page.locator('header a[href]').evaluateAll(nodes => nodes.map(n => ({ href: new URL(n.getAttribute('href'), location.href).pathname, text: (n.getAttribute('aria-label') || n.textContent).trim() })));
        const prefix = languageOf(route) === 'en' ? '/en' : '';
        const expected = menuPages.map(r => prefix + r);
        ensure(expected.every(r => links.some(l => l.href === r && l.text)), { expected, links });
        ensure(links.filter(l => l.href === prefix + '/contact/').length >= 2, { issue: 'Five-menu navigation and separate contact CTA required', links });
        ensure(links.some(l => l.href === counterpart(route) && l.text), { issue: 'Language switch must lead to the same page in the other language', expected: counterpart(route), links });
      }, page);
      if (engine === 'chromium' && [390, 1440].includes(width) && ['/', '/works/', '/contact/', '/team/', '/en/', '/en/works/', '/en/contact/', '/en/team/'].includes(route)) {
        await page.screenshot({ path: path.join(out, `${label}-${filename(route)}.png`), fullPage: true });
      }
    }
    record(label + ' no console or JavaScript errors', errors.length === 0, errors);
    record(label + ' route viewing caused no write attempts', writes.length === 0, writes);
  } finally { await context.close(); }
  console.log(label + ': route matrix complete');
}

async function interactions(browser, engine, lang) {
  const prefix = lang === 'en' ? '/en' : '';
  const label = `${engine}-${lang}`;
  const { context, writes, state } = await guardedContext(browser, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(5000);
  try {
    await test(label + ' mobile menu Escape and focus restoration', async () => {
      await ready(page, prefix + '/');
      const toggle = page.locator('.menu-toggle'), menu = page.locator('#mobile-menu');
      await toggle.click();
      ensure(await toggle.getAttribute('aria-expanded') === 'true' && await menu.isVisible(), 'Menu did not open');
      await page.keyboard.press('Tab');
      ensure(await menu.evaluate(el => el.contains(document.activeElement)), 'Keyboard focus escaped the open mobile menu');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('.menu-toggle')?.getAttribute('aria-expanded') === 'false' && document.activeElement === document.querySelector('.menu-toggle'));
      ensure(await menu.isHidden(), 'Escape did not hide the mobile menu');
      await toggle.click(); await page.locator('.menu-close').click();
      ensure(await menu.isHidden() && await toggle.evaluate(e => e === document.activeElement), 'Close button did not restore focus');
    }, page);
    await test(label + ' service controls support click and keyboard', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await ready(page, prefix + '/works/');
      if (await page.locator('.sb-svc').count()) {
        // Korean WORKS uses the service index (buttons + preview panel) introduced on 2026-10-14.
        const items = page.locator('.sb-svc');
        ensure(await items.count() === 10, { expected: 10, actual: await items.count() });
        const shown = () => page.evaluate(() => [...document.querySelectorAll('.sb-svc-panel .sb-svc-detail')].filter(d => !d.hidden).map(d => d.dataset.for));
        await items.nth(1).click(); const clicked = await shown();
        ensure(clicked.length === 1 && await items.nth(1).getAttribute('aria-pressed') === 'true', { clicked });
        await items.nth(2).focus(); await page.keyboard.press('Enter'); const keyboard = await shown();
        ensure(keyboard[0] === await items.nth(2).getAttribute('data-id') && keyboard[0] !== clicked[0], { clicked, keyboard });
        await page.setViewportSize({ width: 390, height: 844 });
        await items.nth(0).click();
        ensure(await page.evaluate(() => getComputedStyle(document.querySelector('.sb-svc-list>li.is-open .sb-svc-inline')).display === 'block'), 'Mobile service detail did not open inline');
        return { services: 10 };
      }
      const controls = page.locator('[data-service-choice]');
      ensure(await controls.count() === 10, { expected: 10, actual: await controls.count() });
      const second = controls.nth(1); await second.click(); const clicked = await verifyServiceControl(page, second);
      const third = controls.nth(2); await third.focus(); await page.keyboard.press('Enter');
      const keyboard = await verifyServiceControl(page, third);
      ensure(JSON.stringify(clicked) !== JSON.stringify(keyboard), 'Different service selection did not update visible information');
      if (await third.getAttribute('role') === 'tab') {
        await page.keyboard.press('ArrowRight');
        ensure(await controls.nth(3).evaluate(e => e === document.activeElement), 'Tab keyboard arrow did not move focus');
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await controls.nth(0).click(); await verifyServiceControl(page, controls.nth(0));
    }, page);
    await test(label + ' project filters and reset', async () => {
      await ready(page, prefix + '/works/');
      const filters = page.locator('[data-filter]');
      ensure(await filters.count() >= 2, 'Expected all-projects and at least one meaningful project filter');
      const before = await visibleProjects(page); ensure(before.length > 0, 'Expected the honest self-brand project to be available');
      await filters.nth(1).click();
      const selected = await controlState(filters.nth(1));
      ensure(selected.pressed === 'true' || selected.selected === 'true', 'Project filter does not expose its selected state');
      const after = await visibleProjects(page);
      ensure(after.every(item => before.includes(item)), { before, after });
      const key = await filters.nth(1).getAttribute('data-filter');
      const matching = await page.locator('[data-project-card]').evaluateAll((nodes, selected) => nodes.filter(n => !n.hidden && getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 0).every(n => (n.getAttribute('data-services') || '').split(/\s+/).includes(selected)), key);
      ensure(matching, 'A project outside the selected service category remains visible');
      await filters.nth(0).click();
      ensure(JSON.stringify(await visibleProjects(page)) === JSON.stringify(before), 'All-projects reset did not restore the original list');
      return { before: before.length, filtered: after.length };
    }, page);
    await test(label + ' nine team roles support keyboard and mobile panels', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await ready(page, prefix + '/team/');
      if (await page.locator('.sb-role').count()) {
        // Korean TEAM uses native disclosure rows (details/summary) introduced on 2026-10-14.
        const roles = page.locator('.sb-role');
        ensure(await roles.count() === 9, { issue: 'The final scope has nine roles', actual: await roles.count() });
        await roles.nth(8).locator('summary').focus(); await page.keyboard.press('Enter');
        ensure(await roles.nth(8).evaluate(d => d.open), 'Enter did not open the role');
        await roles.nth(3).locator('summary').focus(); await page.keyboard.press(' '); await page.waitForTimeout(300);
        const open = await page.evaluate(() => [...document.querySelectorAll('.sb-role')].map((d, i) => d.open ? i : -1).filter(i => i >= 0));
        ensure(JSON.stringify(open) === '[3]', { open });
        await page.setViewportSize({ width: 390, height: 844 });
        await roles.nth(0).locator('summary').click();
        ensure(await roles.nth(0).evaluate(d => d.open), 'Mobile role did not open');
        ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'The mobile team stage overflows');
        return { roles: 9 };
      }
      const roles = page.locator('[data-service-choice^="role-"]');
      ensure(await roles.count() === 9, { issue: 'The final scope has nine roles', actual: await roles.count() });
      await roles.nth(8).click(); await verifyServiceControl(page, roles.nth(8));
      await page.keyboard.press('ArrowLeft');
      ensure(await roles.nth(7).evaluate(e => e === document.activeElement), 'Team role keyboard navigation did not move to the previous role');
      await verifyServiceControl(page, roles.nth(7));
      await roles.nth(3).focus(); await page.keyboard.press('Enter');
      await verifyServiceControl(page, roles.nth(3));
      await page.setViewportSize({ width: 390, height: 844 });
      await roles.nth(0).click(); const panels = await verifyServiceControl(page, roles.nth(0));
      ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'The mobile team stage overflows');
      return { roles: 9, mobileVisiblePanels: panels.length };
    }, page);
    await test(label + ' invalid inquiry cannot submit', async () => {
      await ready(page, prefix + '/contact/');
      const countBefore = writes.length;
      const form = page.locator('#inquiry-form');
      await form.locator('[type="submit"]').click();
      ensure(writes.length === countBefore, 'An empty inquiry triggered a mutation request');
      const invalid = await form.locator(':invalid,[aria-invalid="true"]').count();
      ensure(invalid > 0, 'Invalid fields are not represented');
    }, page);
    await test(label + ' failed inquiry preserves input and allows retry', async () => {
      const form = await fillValidInquiry(page);
      const before = await formData(form), countBefore = writes.length;
      state.mockFailure = true;
      await form.locator('[type="submit"]').click();
      await page.waitForFunction(() => !document.querySelector('#inquiry-form [type="submit"]')?.disabled, null, { timeout: 7000 });
      // Let the mocked 503 response and its UI handler settle, without an arbitrary long wait.
      await page.waitForTimeout(150);
      ensure(writes.length > countBefore, 'Valid form did not attempt actual delivery');
      ensure(writes.slice(countBefore).every(w => w.action === 'fulfilled-503-in-browser'), 'Unexpected mutation escaped the failure mock');
      ensure(JSON.stringify(await formData(form)) === JSON.stringify(before), 'Failure cleared or changed user input');
      const notices = await page.locator('#inquiry-form [role="status"],#inquiry-form [role="alert"],#inquiry-form [aria-live]').allTextContents();
      ensure(notices.some(t => t.trim().length > 4), 'No accessible failure/retry message was presented');
      ensure(await form.locator('[type="submit"]').isEnabled(), 'Submit remained disabled after failure');
      state.mockFailure = false;
      return { attemptsIntercepted: writes.length - countBefore, backendWrites: 0 };
    }, page);
  } finally { await context.close(); }
}

async function motionTest(browser) {
  const { context } = await guardedContext(browser, { viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const page = await context.newPage(); page.setDefaultTimeout(5000);
  try {
    await test('chromium motion pause and resume', async () => {
      await ready(page, '/');
      // The control intentionally remains disabled until the asynchronously loaded
      // WebGPU/WebGL scene is ready. Software rendering in headless QA can take >5s.
      await page.waitForFunction(() => Boolean(document.querySelector('.hero-art')?.dataset.renderer), null, { timeout: 15000 });
      const toggle = page.locator('[data-motion-toggle]');
      ensure(await toggle.count() > 0 && await toggle.first().isVisible(), 'Motion needs a visible pause control');
      const renderer = await page.locator('.hero-art').getAttribute('data-renderer');
      if (renderer === 'fallback') {
        ensure(await page.locator('.hero-art__fallback').isVisible(), 'Graphics fallback is not visible');
        return { renderer, pauseExercise: 'Not applicable to the static graphics fallback' };
      }
      const before = await toggle.first().getAttribute('aria-pressed');
      await toggle.first().click({ timeout: 15000 });
      const paused = await toggle.first().getAttribute('aria-pressed');
      ensure(paused !== before && ['true', 'false'].includes(paused), { before, paused });
      // Element screenshots include overlapping DOM controls. Clear the pause
      // button's hover first so its border change cannot impersonate scene motion.
      await page.mouse.move(100, 100);
      await page.waitForTimeout(450);
      const canvas = page.locator('main canvas').first();
      if (await canvas.count() && await canvas.isVisible()) {
        const a = checksum(await canvas.screenshot({ path: path.join(out, 'motion-paused-before-pointer.png') }));
        await page.mouse.move(1210, 520); await page.waitForTimeout(250);
        const b = checksum(await canvas.screenshot({ path: path.join(out, 'motion-paused-after-pointer.png') }));
        ensure(a === b, 'Paused canvas kept responding to time/pointer movement');
      }
      const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length);
      ensure(running === 0, { issue: 'Paused UI still runs an infinite animation', running });
      await toggle.first().click();
      ensure(await toggle.first().getAttribute('aria-pressed') === before, 'Motion control did not restore its initial state');
      return { renderer, pauseExercise: 'Canvas paused and resumed; no infinite animation while paused' };
    }, page);
    await test('chromium changing reduced-motion preference stops continuous motion', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(200);
      const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length);
      ensure(running === 0, { running });
      ensure(await page.locator('h1').isVisible(), 'Reduced-motion fallback hides the headline');
    }, page);
  } finally { await context.close(); }
}

(async () => {
  const probe = await fetch(url('/'), { signal: AbortSignal.timeout(5000) });
  ensure(probe.ok, 'The isolated QA server is not ready: ' + probe.status);
  for (const engine of engines) {
    if (motionOnly && engine !== 'chromium') continue;
    let browser;
    try {
      browser = await pw[engine].launch({ headless: true, timeout: 30000 });
      if (motionOnly) { await motionTest(browser); continue; }
      for (const width of engine === 'chromium' ? [390, 768, 1440] : [390, 1440]) await routeMatrix(browser, engine, width);
      for (const lang of ['ko', 'en']) await interactions(browser, engine, lang);
      if (engine === 'chromium') await motionTest(browser);
    } catch (error) { record(engine + ' browser execution', false, String(error.stack || error)); }
    finally { if (browser) await browser.close(); }
  }
})().catch(error => record('QA startup', false, String(error.stack || error))).finally(() => {
  const summary = { startedAt, completedAt: new Date().toISOString(), baseURL: origin, testDataPolicy: 'All browser mutations intercepted; no backend writes; no inquiry success test', total: results.length, passed: results.filter(r => r.pass).length, failed: failures.length, results, mutations: requests, browserMessages };
  fs.writeFileSync(path.join(out, motionOnly ? 'results-motion.json' : 'results.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(out, motionOnly ? 'summary-motion.md' : 'summary.md'), `# Renewal browser QA\n\nTest server: ${origin}\n\nPassed ${summary.passed} / ${summary.total}; failed ${summary.failed}.\n\nAll browser mutations were intercepted. Successful delivery and receipt are outside this UI suite.\n\n${failures.map(f => '- ' + f.name + ': ' + f.detail).join('\n')}\n`);
  console.log(JSON.stringify({ total: summary.total, passed: summary.passed, failed: summary.failed, evidence: out }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
});
