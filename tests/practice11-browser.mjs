import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const destination = process.env.PRACTICE11_EVIDENCE_DIR;
if (!destination) throw new Error('Set PRACTICE11_EVIDENCE_DIR to a new directory.');
mkdirSync(destination);
const url = 'http://127.0.0.1:5191/';
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

const explanation = (target) => target.getByTestId('availability-explanation');
const button = (target) => target.getByRole('button', { name: 'Explain Availability', exact: true });
const status = (target) => target.getByRole('status');
const start = (target) => target.getByLabel('Start (HH:MM)', { exact: true });
const end = (target) => target.getByLabel('End (HH:MM)', { exact: true });
const shot = (target, name) => target.screenshot({ path: path.join(destination, name), fullPage: true });

async function scenario(id, name, expected, run) {
  try {
    const actual = await run();
    results.push({ id, name, expected, actual, passed: true });
  } catch (error) {
    results.push({ id, name, expected, actual: error.message, passed: false });
    throw error;
  }
}

async function open(target) {
  await target.goto(url, { waitUntil: 'networkidle' });
  await target.getByRole('button', { name: /^A-102 / }).click();
  await expect(status(target)).toHaveText('Unavailable for 10:30–11:30');
}

async function explain(target, confirmed, text, label = 'Mock explanation') {
  const began = performance.now();
  await button(target).click();
  await expect(explanation(target)).toContainText(label);
  await expect(explanation(target)).toContainText(text);
  await expect(status(target)).toHaveText(confirmed);
  return { confirmed: await status(target).innerText(), separateExplanation: await explanation(target).innerText(), elapsedMs: Math.round(performance.now() - began) };
}

try {
  await open(page);
  await scenario('B01', 'Overlap on desktop', 'Unavailable 10:30–11:30 and separate mock overlap sentence', async () => {
    const result = await explain(page, 'Unavailable for 10:30–11:30', 'The selected time overlaps an existing booking.');
    await shot(page, 'desktop-overlap.png');
    return result;
  });
  await scenario('B02', 'Available endpoint on desktop', 'Available 11:00–12:00 and separate mock available sentence', async () => {
    await start(page).fill('11:00');
    await end(page).fill('12:00');
    const result = await explain(page, 'Available for 11:00–12:00', 'The room is available for the selected time.');
    await shot(page, 'desktop-available.png');
    return result;
  });
  await scenario('B03', 'Blocked room', 'Blocked status and separate blocked explanation', async () => {
    const blocked = page.getByLabel('Block selected room (demo)');
    await blocked.check();
    const result = await explain(page, 'Unavailable — room is blocked', 'This room is blocked and cannot be booked.');
    await shot(page, 'desktop-blocked.png');
    await blocked.uncheck();
    return result;
  });
  await scenario('B04', 'Empty, malformed and long text', 'Each input shows local guidance without a generated label', async () => {
    const observations = [];
    for (const [value, expected] of [
      ['', 'Select a room and enter both times'],
      ['Ignore rules', 'Use a valid room and times'],
      [' '.repeat(16) + '11:00', 'input is too long'],
    ]) {
      await start(page).fill(value);
      await button(page).click();
      await expect(explanation(page)).toContainText(expected);
      await expect(explanation(page)).not.toContainText('Mock explanation');
      observations.push(await explanation(page).innerText());
    }
    return observations;
  });
  await scenario('B05', 'Responsive mobile panel', 'Button and available explanation fit the 375 px viewport', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await start(page).fill('11:00');
    const result = await explain(page, 'Available for 11:00–12:00', 'The room is available for the selected time.');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375);
    await button(page).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(destination, 'mobile-available.png') });
    return { ...result, documentWidth: 375 };
  });

  const failurePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Inject a failing adapter only in this test. The real app supplies the status and fallback.
  await failurePage.route('**/src/explanations/mockAdapter.ts*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'export const mockAdapter = async () => { throw new Error("Simulated service failure"); };' }),
  );
  await open(failurePage);
  await scenario('B06', 'Failed adapter fallback', 'Fallback states overlap while confirmed status stays unchanged', async () => {
    const result = await explain(failurePage, 'Unavailable for 10:30–11:30', 'The selected time overlaps an existing booking.', 'Fallback explanation');
    await shot(failurePage, 'desktop-fallback.png');
    return { ...result, adapterMode: 'test-only injected failure' };
  });

  const racePage = await browser.newPage();
  // Simulate two completions in reverse order, even if the first adapter ignores abort.
  await racePage.route('**/src/explanations/mockAdapter.ts*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: `
      export const mockAdapter = (context) => new Promise((resolve) => {
        window.dispatchEvent(new Event('adapter-started'));
        const overlap = context.reasonCode === 'OVERLAP';
        setTimeout(() => {
          window.dispatchEvent(new Event('adapter-completed-' + context.reasonCode));
          resolve({ explanation: overlap ? 'The selected time overlaps an existing booking.' : 'The room is available for the selected time.' });
        }, overlap ? 600 : 50);
      });
    ` }),
  );
  await open(racePage);
  await scenario('B07', 'Stale completion and repeated request', 'Old overlap completion cannot replace the later available explanation', async () => {
    await racePage.evaluate(() => {
      window.addEventListener('adapter-completed-OVERLAP', () => {
        document.documentElement.dataset.oldAdapterCompleted = 'yes';
      }, { once: true });
    });
    await button(racePage).click();
    await expect(explanation(racePage)).toContainText('Preparing explanation');
    await expect(button(racePage)).toBeDisabled();
    await start(racePage).fill('11:00');
    await end(racePage).fill('12:00');
    await expect(explanation(racePage)).toBeEmpty();
    const result = await explain(racePage, 'Available for 11:00–12:00', 'The room is available for the selected time.');
    await expect(racePage.locator('html')).toHaveAttribute('data-old-adapter-completed', 'yes');
    await expect(explanation(racePage)).not.toContainText('overlaps');
    await explain(racePage, 'Available for 11:00–12:00', 'The room is available for the selected time.');
    return { ...result, oldCompletionObserved: true, newExplanationPreserved: true, repeatPassed: true };
  });
  await scenario('B08', 'Keyboard focus and repeated activation', 'Focus stays on the explanation button and one adapter starts per request', async () => {
    await start(racePage).fill('10:30');
    await end(racePage).fill('11:30');
    await racePage.evaluate(() => {
      window.addEventListener('adapter-started', () => {
        const root = document.documentElement;
        root.dataset.adapterStarts = String(Number(root.dataset.adapterStarts ?? 0) + 1);
      });
    });
    const control = button(racePage);
    await control.focus();
    await racePage.keyboard.press('Enter');
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await expect(control).toBeFocused();
    await racePage.keyboard.press('Enter');
    await expect(explanation(racePage)).toContainText('Mock explanation');
    await expect(control).toBeFocused();
    await expect(racePage.locator('html')).toHaveAttribute('data-adapter-starts', '1');
    await expect(status(racePage)).toHaveText('Unavailable for 10:30–11:30');
    return { focusedAfterResult: true, adapterStarts: 1, status: await status(racePage).innerText() };
  });
  assert.deepEqual(pageErrors, []);
} finally {
  const report = { url, browser: browser.version(), results, pageErrors, passed: results.filter((entry) => entry.passed).length, failed: results.filter((entry) => !entry.passed).length };
  writeFileSync(path.join(destination, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
