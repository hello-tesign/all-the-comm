const { chromium, firefox, webkit } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const out = path.resolve('qa/isos-2026-10-12/final');
const checks = [], errors = [], blockedWrites = [], samples = [];
const files = [
  { name: '기획서_한글.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n% synthetic local chooser fixture\n%%EOF') },
  { name: '브랜드전략_콘텐츠디자인_장기프로젝트_'.repeat(7) + '참고.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kXl0AAAAASUVORK5CYII=', 'base64') },
  { name: '자료_<img src=x>.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kXl0AAAAASUVORK5CYII=', 'base64') },
];
let activePage, activeLabel = 'startup';
function check(name, passed, detail) {
  checks.push({ name, passed: !!passed, ...(detail === undefined ? {} : { detail }) });
  if (!passed) console.error('FAIL ' + name + ': ' + JSON.stringify(detail));
}
async function visit(page, url) {
  await page.goto(base + url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
}
async function sampleTab(page, label, index) {
  const tab = page.locator('[data-capabilities] [role=tab]').nth(index);
  const promise = page.evaluate(() => new Promise(resolve => {
    const stage = document.querySelector('[data-capabilities]');
    const inspect = () => {
      const panel = [...stage.querySelectorAll('[role=tabpanel]')].find(p => !p.hidden);
      const copy = panel.querySelector('.capability-copy,.discipline-copy');
      const elements = [...copy.querySelectorAll('h3,p:not(.eyebrow),a')];
      return elements.map(el => {
        const bounds = el.getBoundingClientRect(), chain = [], clipping = [];
        let ancestor = el;
        while (ancestor) {
          const style = getComputedStyle(ancestor), rect = ancestor.getBoundingClientRect();
          chain.push({ node: ancestor.className || ancestor.tagName, opacity: Number(style.opacity) });
          if (ancestor !== el && ['hidden', 'clip', 'auto', 'scroll'].some(v => style.overflowX === v || style.overflowY === v)) {
            const clippedX = ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX) && (bounds.left < rect.left - 1 || bounds.right > rect.right + 1);
            const clippedY = ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY) && (bounds.top < rect.top - 1 || bounds.bottom > rect.bottom + 1);
            if (clippedX || clippedY) clipping.push({ parent: ancestor.className, clippedX, clippedY });
          }
          ancestor = ancestor.parentElement;
        }
        return { text: el.textContent.trim(), tag: el.tagName, visible: el.checkVisibility(), opacityOne: chain.every(p => p.opacity === 1), width: bounds.width, height: bounds.height, clipping, chain };
      });
    };
    stage.addEventListener('click', function start(event) {
      if (!event.target.closest('[role=tab]')) return;
      stage.removeEventListener('click', start);
      let nextFrame, after220;
      const done = () => { if (nextFrame && after220) resolve({ nextFrame, after220 }); };
      requestAnimationFrame(() => { nextFrame = inspect(); done(); });
      setTimeout(() => { after220 = inspect(); done(); }, 220);
    });
  }));
  await tab.click();
  const result = await promise;
  samples.push({ label, index, ...result });
  for (const [moment, nodes] of Object.entries(result)) {
    check(label + ' ' + moment + ' title description CTA present', nodes.some(n => n.tag === 'H3') && nodes.some(n => n.tag === 'P') && nodes.some(n => n.tag === 'A'));
    check(label + ' ' + moment + ' text and ancestor opacity remain one', nodes.every(n => n.opacityOne), nodes.filter(n => !n.opacityOne));
    check(label + ' ' + moment + ' text remains visible and unclipped', nodes.every(n => n.visible && n.width > 0 && n.height > 0 && n.clipping.length === 0), nodes.filter(n => !n.visible || n.clipping.length));
  }
}
async function gridAndKeyboard(page, label, width) {
  const metrics = await page.locator('.capability-tabs').evaluate(el => {
    const bounds = el.getBoundingClientRect(), rows = new Map();
    const buttons = [...el.querySelectorAll('[role=tab]')].map(button => {
      const b = button.getBoundingClientRect(), key = Math.round(b.top);
      rows.set(key, (rows.get(key) || 0) + 1);
      return { text: button.textContent, left: b.left, right: b.right, width: b.width, textFits: button.scrollWidth <= button.clientWidth + 1 };
    });
    return { display: getComputedStyle(el).display, rows: [...rows.values()], buttons,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      contained: buttons.every(b => b.left >= bounds.left - 1 && b.right <= bounds.right + 1 && b.width > 0) };
  });
  check(label + ' grid is five columns and two rows', metrics.display === 'grid' && JSON.stringify(metrics.rows) === '[5,5]', metrics);
  check(label + ' all ten labels fit without overflow', metrics.buttons.length === 10 && metrics.contained && !metrics.overflow && metrics.buttons.every(b => b.textFits), metrics);
  const buttons = page.locator('.capability-tabs [role=tab]');
  await buttons.first().focus();
  await page.keyboard.press('ArrowRight');
  check(label + ' ArrowRight selects second service', await buttons.nth(1).getAttribute('aria-selected') === 'true' && await buttons.nth(1).evaluate(el => el === document.activeElement));
  await page.keyboard.press('End');
  check(label + ' End reaches tenth service', await buttons.nth(9).getAttribute('aria-selected') === 'true');
  await page.keyboard.press('Home');
  check(label + ' Home and one visible panel preserved', await buttons.first().getAttribute('aria-selected') === 'true' && await page.locator('[data-service-panel]').evaluateAll(panels => panels.filter(p => !p.hidden && p.checkVisibility()).length) === 1);
  await page.screenshot({ path: path.join(out, label.replaceAll(' ', '-') + '-grid.png') });
}
async function attachment(page, engineName) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/contact/');
  const label = engineName + ' attachment', input = page.locator('#attachments'), names = page.locator('.attachment-names');
  check(label + ' single native multiple file input preserved', await input.count() === 1 && await input.getAttribute('type') === 'file' && await input.getAttribute('name') === 'attachments' && await input.getAttribute('multiple') !== null);
  check(label + ' Korean chooser copy visible', await page.locator('.attachment-display').isVisible() && await page.locator('.attachment-trigger').textContent() === '파일 선택' && await names.textContent() === '선택한 파일이 없습니다');
  await page.locator('[name=company]').fill('첨부 UI 검수용 가상 회사');
  await page.locator('[name=message]').fill('전송하지 않는 첨부파일 표시 검수입니다.');
  await page.locator('[name=schedule]').focus();
  await page.keyboard.press('Tab');
  check(label + ' Tab reaches real file input', await input.evaluate(el => el === document.activeElement));
  check(label + ' visible focus outline on custom display', await page.locator('.attachment-display').evaluate(el => getComputedStyle(el).outlineStyle !== 'none'));
  await input.setInputFiles(files);
  const selected = await input.evaluate(el => [...el.files].map(f => f.name));
  check(label + ' three in-memory filenames retained', JSON.stringify(selected) === JSON.stringify(files.map(f => f.name)), selected);
  check(label + ' safe textContent displays Korean long and HTML-like names', await names.textContent() === files.map(f => f.name).join(' · ') && await names.locator('*').count() === 0);
  check(label + ' long filename creates no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const chooserPromise = page.waitForEvent('filechooser');
  await input.click();
  const chooser = await chooserPromise;
  check(label + ' pointer opens native multiple file chooser', chooser.isMultiple() && await chooser.element().getAttribute('id') === 'attachments');
  await chooser.setFiles(files);
  await page.locator('.attachment-control').scrollIntoViewIfNeeded();
  check(label + ' selecting files preserves other field values', await page.locator('[name=company]').inputValue() === '첨부 UI 검수용 가상 회사' && await page.locator('[name=message]').inputValue() === '전송하지 않는 첨부파일 표시 검수입니다.');
  await page.screenshot({ path: path.join(out, engineName + '-attachment-selected.png') });
  await page.locator('#inquiry-form').evaluate(form => form.reset());
  await page.waitForFunction(() => document.querySelector('.attachment-names').textContent === '선택한 파일이 없습니다');
  check(label + ' form.reset clears native files and display', await input.evaluate(el => el.files.length === 0 && el.value === '') && await names.textContent() === '선택한 파일이 없습니다');
  check(label + ' no false submission result', await page.locator('#form-status').textContent() === '');
  await page.setViewportSize({ width: 390, height: 844 });
  check(label + ' mobile keeps visible native input with new display hidden', await input.evaluate(el => el.checkVisibility() && getComputedStyle(el).opacity === '1' && getComputedStyle(el).position !== 'absolute') && !await page.locator('.attachment-display').isVisible());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/en/contact/');
  check(label + ' English keeps native input without Korean display', await page.locator('#attachments').evaluate(el => el.checkVisibility() && getComputedStyle(el).opacity === '1') && await page.locator('.attachment-display,.attachment-control').count() === 0);
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
      const page = await context.newPage(); activePage = page;
      page.on('pageerror', error => errors.push({ engine: engineName, url: page.url(), message: error.message }));
      for (const width of [1440, 1060]) {
        activeLabel = engineName + ' works ' + width;
        await page.setViewportSize({ width, height: 1000 });
        await visit(page, '/works/');
        await gridAndKeyboard(page, activeLabel, width);
        await sampleTab(page, activeLabel + ' digital', 1);
        await sampleTab(page, activeLabel + ' PR', 9);
      }
      activeLabel = engineName + ' team';
      await page.setViewportSize({ width: 1440, height: 1000 });
      await visit(page, '/team/');
      await sampleTab(page, activeLabel + ' digital', 1);
      await sampleTab(page, activeLabel + ' PR', 8);
      activeLabel = engineName + ' contact';
      await attachment(page, engineName);
      console.log(engineName + ' polish checked');
    } finally { await browser.close(); }
  }
  check('No runtime JavaScript errors', errors.length === 0, errors);
  check('No enquiry or mutation attempted', blockedWrites.length === 0, blockedWrites);
}
run().catch(async error => {
  check(activeLabel + ' test completed', false, error.stack || error.message);
  if (activePage) await activePage.screenshot({ path: path.join(out, 'polish-failure.png') }).catch(() => {});
}).finally(async () => {
  const result = { date: new Date().toISOString(), scope: 'Only final polish: immediate tab text, Korean PC service grid, native file-input Korean presentation. GET-only local UI, no enquiry submission. Original 413-check results preserved.', base, passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, checks, errors, blockedWrites, samples };
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, 'polish-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: errors.length, blockedWrites: blockedWrites.length }));
  if (result.failed) process.exitCode = 1;
});
