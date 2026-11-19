import { chromium, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const url = 'http://127.0.0.1:5191/';
try {
  const page = await browser.newPage();
  await page.goto(url);
  await page.getByRole('button', { name: /^A-102 / }).click();
  const button = page.getByRole('button', { name: 'Explain Availability' });
  const focus = () => page.evaluate(() => document.activeElement.tagName);
  await button.focus();
  const before = await focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('availability-explanation')).toContainText('Mock explanation');
  const after = await focus();
  assert.equal(before, 'BUTTON');
  assert.equal(after, 'BODY');
  console.log(JSON.stringify({ id: 'R11-01', expected: 'BUTTON after Enter and result', observed: { before, after }, classification: 'CONFIRMED' }));

  const response = await page.evaluate(async () => {
    const { explainAvailability } = await import('/src/explanations/service.ts');
    const context = { roomLabel: 'A-102', startTime: '11:00', endTime: '12:00', isAvailable: true, reasonCode: 'AVAILABLE' };
    const output = { extra: true };
    Object.defineProperty(output, 'explanation', { value: 'The room is available for the selected time.' });
    const result = await explainAvailability(context, async () => output, new AbortController().signal);
    return { allOwnKeys: Reflect.ownKeys(output), enumerableKeys: Object.keys(output), source: result.source };
  });
  assert.deepEqual(response.allOwnKeys, ['extra', 'explanation']);
  assert.equal(response.source, 'mock');
  console.log(JSON.stringify({ id: 'R11-02', expected: 'fallback', observed: response, classification: 'CONFIRMED' }));

  const read = (file) => readFileSync(new URL(file, new URL('../../../', import.meta.url)), 'utf8');
  const runner = read('tests/practice11-browser.mjs');
  const listeners = [...runner.matchAll(/(\w+)\.on\('pageerror'/g)].map((match) => match[1]);
  const pages = [...runner.matchAll(/const (\w+) = await browser\.newPage/g)].map((match) => match[1]);
  assert.deepEqual(pages, ['page', 'failurePage', 'racePage']);
  assert.deepEqual(listeners, ['page']);
  console.log(JSON.stringify({ id: 'R11-03', expected: 'all browser pages included in runtime-error evidence', observed: { pages, listeners }, classification: 'CONFIRMED' }));

  const panel = read('src/components/BookingPanel.tsx');
  const contextSource = read('src/explanations/context.ts');
  assert.match(panel, /key=\{JSON\.stringify\(\[room\.name, room\.blocked, startTime, endTime/);
  assert.match(contextSource, /startTime\.length > MAX_TIME_LENGTH/);
  console.log(JSON.stringify({ id: 'R11-04', observed: 'Raw times are used in the reset key. The context separately rejects overlength inputs.', unverified: 'User-visible slowdown', classification: 'PLAUSIBLE / UNVERIFIED' }));

  const app = read('src/App.tsx');
  assert.match(app, /const \[bookings\] = useState/);
  const browserRun = JSON.parse(read('practice11/evidence/implementation/ui/results.json'));
  const race = browserRun.results.find((item) => item.id === 'B07');
  assert.equal(race.passed, true);
  assert.equal(race.actual.newExplanationPreserved, true);
  console.log(JSON.stringify({ id: 'R11-05', observed: 'No bookings setter. B07 observed old completion with current explanation preserved.', classification: 'UNSUPPORTED in the current app' }));
} finally {
  await browser.close();
}
