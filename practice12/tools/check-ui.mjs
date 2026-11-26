import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const [platform, origin, destination] = process.argv.slice(2);
assert(['code', 'appsmith'].includes(platform) && origin && destination,
  'Usage: node practice12/tools/check-ui.mjs code|appsmith URL EVIDENCE_DIR');
const { tests } = JSON.parse(await readFile(new URL('../fixtures.json', import.meta.url), 'utf8'));
await mkdir(destination, { recursive: true });

const startTime = new Date().toISOString();
const results = [];
const security = [];
const pageErrors = [];
const isCode = platform === 'code';
const browser = isCode
  ? await chromium.launch({ channel: 'chrome', headless: true })
  : await chromium.connectOverCDP(process.env.PRACTICE12_CHROME_CDP ?? 'http://127.0.0.1:9238');
const context = isCode ? await browser.newContext() : browser.contexts()[0];
const page = await context.newPage();
await page.setViewportSize({ width: 1360, height: 850 });
page.on('pageerror', (error) => pageErrors.push(error.message));
const start = isCode ? page.getByLabel('Start time (HH:MM)', { exact: true }) : page.locator('.t--widget-input1 input');
const duration = isCode ? page.getByLabel('Duration (minutes)', { exact: true }) : page.locator('.t--widget-input2 input');
const blocked = page.getByRole('checkbox', { name: 'Room blocked', exact: true });
const button = page.getByRole('button', { name: 'Check Availability', exact: true });
const status = isCode ? page.getByRole('status') : page.locator('.t--widget-text2');
const table = page.getByRole('table');
const screenshot = (name) => page.screenshot({ path: path.join(destination, name) });

async function check(input) {
  await start.fill(input.start);
  await duration.fill(input.duration);
  if (await blocked.isChecked() !== input.blocked) await blocked.press('Space');
  await expect(blocked).toBeChecked({ checked: input.blocked });
  await button.press('Enter');
  await expect(status).toContainText(input.reason, { timeout: 6000 });
  const visible = (await status.innerText()).trim().replace(/\s+/g, ' ');
  assert.match(visible, input.available ? /^Available\b/ : /^Unavailable\b/);
  if (isCode) assert.equal(await status.locator('[data-available]').getAttribute('data-available'), String(input.available));
  return visible;
}

async function openPreview() {
  if (isCode) return;
  const editMode = page.getByTestId('edit-mode');
  const previewMode = page.getByTestId('preview-mode');
  await expect(editMode.or(previewMode)).toBeVisible();
  if (await editMode.isVisible()) await editMode.click();
  await expect(previewMode).toBeVisible();
  const canvas = page.locator('section.canvas');
  await canvas.evaluate((element) => element.scrollTo({ top: 0, left: 0 }));
}

async function bookingValues() {
  return (await table.getByRole('cell').allTextContents()).map((cell) => cell.trim()).filter(Boolean);
}

async function runCase(collection, input, checkCase) {
  const tick = performance.now();
  try {
    collection.push({ id: input.id, input, observed: await checkCase(), pass: true, elapsedMs: Math.round(performance.now() - tick) });
  } catch (error) {
    collection.push({ id: input.id, input, observed: error.message, pass: false, elapsedMs: Math.round(performance.now() - tick) });
  }
}

let mobile;
try {
  await page.goto(origin);
  if (!isCode && await page.getByRole('heading', { name: /sign in/i }).isVisible()) {
    throw new Error('Sign in to Appsmith in the test browser before replaying.');
  }
  await openPreview();
  await expect(button).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Lab Team 3' })).toBeVisible();
  await screenshot('04-running.png');
  const before = await bookingValues();
  assert.deepEqual(before, ['10:00', '11:00', 'Lab Team 3']);
  for (const test of tests.slice(0, 7)) {
    await runCase(results, test, async () => {
      const result = await check(test);
      await screenshot(test.id + '.png');
      return result;
    });
  }
  await runCase(results, tests[7], async () => {
    const after = await bookingValues();
    assert.deepEqual(after, before);
    await screenshot('T8.png');
    return { before, after };
  });

  const sample = { start: '12:00', duration: '60', blocked: false, available: false };
  const safeCases = [
    { id: 'D1', start: '', reason: 'INVALID_START' },
    { id: 'D2', start: '25:99', reason: 'INVALID_START' },
    { id: 'D3', start: '<b>demo</b>', reason: 'INVALID_START' },
    { id: 'D4', duration: '', reason: 'INVALID_DURATION' },
    { id: 'D5', duration: '1.5', reason: 'INVALID_DURATION' },
    { id: 'D6', duration: '<b>demo</b>', reason: 'INVALID_DURATION' },
    { id: 'D7', start: '09:00', duration: '0', blocked: true, reason: 'START_NOT_FUTURE' },
    { id: 'D8', start: '23:30', duration: '60', reason: 'END_OUT_OF_DAY' },
    { id: 'D9', duration: '120', available: true, reason: 'AVAILABLE' },
  ];
  for (const entry of safeCases) {
    const input = { ...sample, ...entry };
    await runCase(security, input, async () => {
      const result = await check(input);
      assert(!result.includes('<b>demo</b>'));
      assert.equal(await status.getByText('demo', { exact: true }).count(), 0);
      assert.deepEqual(await bookingValues(), before);
      if (input.id === 'D3') await screenshot('D3-html-like.png');
      return result;
    });
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await openPreview();
  try {
    const observed = await check(tests[0]);
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    const widgets = await Promise.all([start, duration, blocked, button, table].map((control) => control.boundingBox()));
    const withinWidth = widgets.every((box) => box && box.x >= -1 && box.x + box.width <= viewport.width + 1);
    const bookingOwnerReadable = await table.getByRole('cell', { name: 'Lab Team 3', exact: true }).evaluate((cell) => {
      const text = document.createRange();
      text.selectNodeContents(cell);
      return text.getBoundingClientRect().right <= cell.getBoundingClientRect().right + 1;
    });
    const decisionReadable = await status.evaluate((element) => {
      const nodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const text = document.createRange();
      let node = nodes.nextNode();
      while (node) {
        if (node.textContent.trim()) {
          text.selectNode(node);
          if ([...text.getClientRects()].some((rect) => rect.left < 0 || rect.right > window.innerWidth + 1)) return false;
        }
        node = nodes.nextNode();
      }
      return true;
    });
    await screenshot('mobile.png');
    mobile = { observed, viewport, widgets, withinWidth, bookingOwnerReadable, decisionReadable };
    assert.equal(viewport.documentWidth, viewport.width);
    assert.equal(withinWidth, true);
    assert.equal(bookingOwnerReadable, true);
    assert.equal(decisionReadable, true);
  } catch (error) {
    mobile = { ...mobile, error: error.message };
    await screenshot('mobile.png');
    if (isCode) throw error;
  }
} finally {
  const record = { platform, origin, startTime, endTime: new Date().toISOString(), results, security, mobile, pageErrors };
  await writeFile(path.join(destination, 'ui-results.json'), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record, null, 2));
  await page.close();
  await browser.close();
}
assert.equal(results.filter(({ pass }) => pass).length, 8);
assert.equal(security.filter(({ pass }) => pass).length, 9);
assert(mobile && !mobile.error);
assert.deepEqual(pageErrors, []);
