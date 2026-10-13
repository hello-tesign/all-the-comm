const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const base = process.env.MOTION_URL || 'http://127.0.0.1:4173';
  const results = [];
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const host = page.locator('.hero-art');
    await page.waitForFunction(() => ['webgl', 'webgpu'].includes(document.querySelector('.hero-art')?.dataset.renderer));
    results.push({ check: 'GPU scene initializes', backend: await host.getAttribute('data-renderer') });
    const toggle = page.locator('[data-motion-toggle]');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    assert.equal(await host.getAttribute('data-motion'), 'paused');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    const canvas = page.locator('#brand-canvas');
    const pausedFrame = await canvas.screenshot({ mask: [toggle] });
    const bounds = await canvas.boundingBox();
    await page.mouse.move(bounds.x + bounds.width * 0.78, bounds.y + bounds.height * 0.2);
    await page.waitForTimeout(250);
    assert.equal(Buffer.compare(pausedFrame, await canvas.screenshot({ mask: [toggle] })), 0);
    results.push({ check: 'Paused pixels remain unchanged after pointer movement', pass: true });
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    results.push({ check: 'User can pause and resume autonomous motion', pass: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.hero-art')?.dataset.motion === 'paused');
    assert.equal(await toggle.isDisabled(), true);
    results.push({ check: 'Motion preference changes apply without reloading', pass: true });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('.hero-art')?.dataset.motion === 'playing');
    assert.equal(await toggle.isDisabled(), false);
    results.push({ check: 'Normal motion resumes when user preference changes back', pass: true });
    await page.evaluate(() => {
      const canvas = document.querySelector('#brand-canvas');
      const gl = canvas.getContext('webgl2');
      window.__motionContextExtension = gl?.getExtension('WEBGL_lose_context');
      if (window.__motionContextExtension) window.__motionContextExtension.loseContext();
      else canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    });
    await page.waitForFunction(() => document.querySelector('.hero-art')?.dataset.renderer === 'fallback');
    assert.equal(await host.getAttribute('data-renderer'), 'fallback');
    results.push({ check: 'Context loss selects static fallback', pass: true });
    await page.evaluate(() => {
      if (window.__motionContextExtension) window.__motionContextExtension.restoreContext();
      else document.querySelector('#brand-canvas').dispatchEvent(new Event('webglcontextrestored'));
      delete window.__motionContextExtension;
    });
    await page.waitForFunction(() => ['webgl', 'webgpu'].includes(document.querySelector('.hero-art')?.dataset.renderer));
    results.push({ check: 'Context restoration recovers the scene', pass: true });
    assert.deepEqual(errors, []);
    await fs.mkdir(path.resolve('motion/qa'), { recursive: true });
    await fs.writeFile(path.resolve('motion/qa/runtime-results.json'), JSON.stringify({ results, errors }, null, 2));
    console.log(JSON.stringify({ passed: results.length, results, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
