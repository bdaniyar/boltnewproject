import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Run the real Vite app first: npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
// Then: node tests/practice08-browser.mjs
// No requests are mocked, no state is injected, and all input uses public controls.
const project = fileURLToPath(new URL('..', import.meta.url));
const submission = path.resolve(project, 'practice08/evidence/ui');
const shots = submission;
const results = submission;
mkdirSync(shots, { recursive: true });
mkdirSync(results, { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  command: 'node tests/practice08-browser.mjs',
  url: process.env.PRACTICE08_URL || 'http://127.0.0.1:5174',
  framework: 'Playwright with installed Google Chrome',
  checks: [],
  screenshots: [],
  consoleErrors: [],
  limitations: [
    'Automated Chrome checks; no separate human usability session or physical mobile device.',
    'Timeline preservation compares all five rendered booking records, including owner and interval. Object-level immutability is checked separately by the unit suite.',
    'B-201 is initially blocked and has no bookings; its disabled card is checked, while the four selectable room timelines expose all five existing records.',
  ],
};
let browser;
let page;
let activeCheck = '';
const log = [];
function passed(id, description, observations = {}) {
  report.checks.push({ id, description, status: 'passed', ...observations });
  log.push(`PASS ${id}: ${description}`);
  console.log(log.at(-1));
}
async function screenshot(name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(shots, name), fullPage: true });
  report.screenshots.push(name);
}
async function setTimes(start, end) {
  await page.getByLabel('Start (HH:MM)', { exact: true }).fill(start);
  await page.getByLabel('End (HH:MM)', { exact: true }).fill(end);
}
async function selectRoom(name) {
  await page.getByRole('button', { name: new RegExp(`^${name} `) }).click();
  await expect(page.getByRole('heading', { name: `Today's Schedule — ${name}`, exact: true })).toBeVisible();
}
async function timelineSnapshot() {
  const snapshot = {};
  for (const room of ['A-101', 'A-102', 'B-202', 'C-301']) {
    await selectRoom(room);
    const timeline = page.getByRole('heading', { name: `Today's Schedule — ${room}`, exact: true }).locator('..').locator('..');
    snapshot[room] = await timeline.locator('[title]').evaluateAll((bars) => bars.map((bar) => ({
      title: bar.getAttribute('title'),
      text: bar.textContent,
      left: bar.style.left,
      width: bar.style.width,
    })));
  }
  await expect(page.getByRole('button', { name: /^B-201 / })).toBeDisabled();
  snapshot['B-201'] = [];
  return snapshot;
}
async function storageSnapshot() {
  return page.evaluate(() => ({
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
  }));
}
async function helperResult(start, end, blocked = false) {
  // Import the same source module Vite serves to App/BookingPanel. This reads
  // the helper independently; it never overwrites the application's logic/state.
  return page.evaluate(async ({ start, end, blocked }) => {
    const { checkAvailability, validateBooking } = await import('/src/bookingLogic.ts');
    const { SAMPLE_ROOMS, SAMPLE_BOOKINGS } = await import('/src/sampleData.ts');
    const room = { ...SAMPLE_ROOMS.find((entry) => entry.name === 'A-102'), blocked };
    return {
      availability: checkAvailability(start, end, room, SAMPLE_BOOKINGS, 540),
      valid: validateBooking(start, end, room, SAMPLE_BOOKINGS, 540).valid,
    };
  }, { start, end, blocked });
}
async function checkLayout(width, height) {
  await page.setViewportSize({ width, height });
  await selectRoom('A-102');
  await setTimes('11:00', '12:00');
  const controls = [
    page.getByLabel('Current hour', { exact: true }),
    page.getByLabel('Current minute', { exact: true }),
    page.getByLabel('Start (HH:MM)', { exact: true }),
    page.getByLabel('End (HH:MM)', { exact: true }),
    page.getByLabel('Block selected room (demo)', { exact: true }),
    page.getByRole('status'),
  ];
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1, `Control outside ${width}px viewport`);
  }
  // Verify usable inputs/results after scrolling on each actual viewport.
  await page.getByLabel('End (HH:MM)', { exact: true }).fill('12:01');
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:01');
  await page.getByLabel('End (HH:MM)', { exact: true }).fill('12:00');
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
  await page.getByLabel('Block selected room (demo)', { exact: true }).check();
  await expect(page.getByRole('status')).toHaveText('Unavailable — room is blocked');
  await page.getByLabel('Block selected room (demo)', { exact: true }).uncheck();
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
  const timeline = page.getByRole('heading', { name: "Today's Schedule — A-102", exact: true }).locator('..').locator('..');
  const scroller = timeline.locator('.overflow-x-auto');
  await scroller.scrollIntoViewIfNeeded();
  const timelineScroll = await scroller.evaluate((element) => {
    element.scrollLeft = 504;
    return { scrollLeft: element.scrollLeft, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
  });
  assert.ok(timelineScroll.scrollLeft > 0, 'The timeline must scroll internally');
  const bookingBar = timeline.locator('[title="Lab Team 3 · 10:00–11:00"]');
  const barBox = await bookingBar.boundingBox();
  const scrollBox = await scroller.boundingBox();
  assert.ok(barBox && scrollBox && barBox.x >= scrollBox.x && barBox.x + barBox.width <= scrollBox.x + scrollBox.width,
    'The existing 10:00–11:00 booking must be fully visible after internal timeline scroll');
  const dimensions = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    documentScrollWidth: document.documentElement.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(dimensions.documentScrollWidth <= width, JSON.stringify(dimensions));
  return { ...dimensions, timelineScroll };
}

try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  report.browserVersion = browser.version();
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (error) => report.consoleErrors.push(error.message));
  await page.goto(report.url, { waitUntil: 'networkidle' });

  activeCheck = 'SETUP';
  await page.getByLabel('Current hour', { exact: true }).fill('9');
  await page.getByLabel('Current minute', { exact: true }).fill('0');
  await expect(page.getByLabel('Current hour', { exact: true })).toHaveValue('9');
  await expect(page.getByLabel('Current minute', { exact: true })).toHaveValue('0');
  await selectRoom('A-102');
  const expectedRecords = {
    'A-101': ['Prof. Chen · 09:00–10:00', 'Study Group A · 12:00–13:00'],
    'A-102': ['Lab Team 3 · 10:00–11:00'],
    'B-202': ['Prof. Diaz · 08:00–09:00'],
    'C-301': ['Open Lecture · 15:00–16:00'],
    'B-201': [],
  };
  const before = await timelineSnapshot();
  for (const [room, titles] of Object.entries(expectedRecords)) {
    assert.deepEqual(before[room].map((entry) => entry.title), titles, `${room} original fictional fixtures`);
  }
  report.dataBefore = before;
  const storageBefore = await storageSnapshot();
  passed('SETUP', 'Real controls set current time to 09:00; all five existing timeline records match the source fixtures.');
  await selectRoom('A-102');
  await screenshot('01-desktop.png');

  activeCheck = 'UI01';
  await setTimes('11:00', '12:00');
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
  assert.deepEqual(await helperResult(660, 720), { availability: 'available', valid: true });
  passed('UI01', 'A-102 displays Available for 11:00–12:00 at 09:00; same real helper accepts it.');
  await screenshot('02-available.png');

  activeCheck = 'UI02';
  await page.getByLabel('Block selected room (demo)', { exact: true }).check();
  await expect(page.getByRole('status')).toHaveText('Unavailable — room is blocked');
  await expect(page.getByText('Room A-102 is currently blocked and cannot be booked.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^A-102 / })).toBeDisabled();
  assert.deepEqual(await helperResult(660, 720, true), { availability: 'blocked', valid: false });
  passed('UI02', 'The same selected A-102 is blocked through real React room state and displays Unavailable.');
  await screenshot('03-unavailable.png');
  await page.getByLabel('Block selected room (demo)', { exact: true }).uncheck();
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');

  activeCheck = 'UI03';
  await page.getByLabel('Start (HH:MM)', { exact: true }).fill('');
  await expect(page.getByRole('status')).toHaveText('Unavailable — enter valid times');
  await expect(page.getByText('Enter a valid start time in HH:MM format (00:00–24:00).', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Start (HH:MM)', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  passed('UI03', 'Clearing required start input displays clear HH:MM validation feedback.');
  await screenshot('04-validation.png');

  activeCheck = 'AC1-PAST';
  await setTimes('08:00', '08:30');
  await expect(page.getByRole('status')).toHaveText('Unavailable for 08:00–08:30');
  await expect(page.getByText('Start time must be after the current time (09:00).', { exact: true })).toBeVisible();
  passed('AC1-PAST', 'A past request is rejected with current-time feedback.');

  activeCheck = 'AC1-ORDER';
  await setTimes('12:00', '12:00');
  await expect(page.getByRole('status')).toHaveText('Unavailable for 12:00–12:00');
  await expect(page.getByText('Start time must be earlier than end time.', { exact: true })).toBeVisible();
  await setTimes('12:30', '12:00');
  await expect(page.getByRole('status')).toHaveText('Unavailable for 12:30–12:00');
  await expect(page.getByText('Start time must be earlier than end time.', { exact: true })).toBeVisible();
  passed('AC1-ORDER', 'Zero-duration and reversed requests are rejected with order feedback.');

  activeCheck = 'INT01';
  await setTimes('12:00', '14:00');
  await expect(page.getByRole('status')).toHaveText('Available for 12:00–14:00');
  assert.deepEqual(await helperResult(720, 840), { availability: 'available', valid: true });
  passed('INT01', 'UI and imported real helper allow exactly 120 minutes.');

  activeCheck = 'INT02';
  await setTimes('12:00', '14:01');
  await expect(page.getByRole('status')).toHaveText('Unavailable for 12:00–14:01');
  await expect(page.getByText('Booking duration is 121 minutes — the maximum allowed is 120 minutes.', { exact: true })).toBeVisible();
  assert.deepEqual(await helperResult(720, 841), { availability: 'unavailable', valid: false });
  passed('INT02', 'UI and imported real helper reject 121 minutes with an exact duration message.');

  activeCheck = 'INT03';
  await setTimes('09:30', '10:00');
  await expect(page.getByRole('status')).toHaveText('Available for 09:30–10:00');
  assert.deepEqual(await helperResult(570, 600), { availability: 'available', valid: true });
  passed('INT03', 'UI and real helper allow touching the start of the existing 10:00–11:00 booking.');

  activeCheck = 'INT04';
  await setTimes('10:30', '11:30');
  await expect(page.getByRole('status')).toHaveText('Unavailable for 10:30–11:30');
  await expect(page.getByText('Overlaps existing booking by Lab Team 3 (10:00–11:00).', { exact: true })).toBeVisible();
  assert.deepEqual(await helperResult(630, 690), { availability: 'unavailable', valid: false });
  passed('INT04', 'UI and real helper reject partial overlap with the actual existing A-102 booking.');
  await screenshot('07-overlap.png');

  activeCheck = 'UI04-DESKTOP';
  const desktop = await checkLayout(1440, 900);
  passed('UI04-DESKTOP', 'All important controls operate at 1440×900 with no document horizontal overflow.', desktop);

  activeCheck = 'UI04-MOBILE';
  const mobile = await checkLayout(375, 812);
  passed('UI04-MOBILE', 'All important controls operate at 375×812 with vertical scrolling and no document horizontal overflow.', mobile);
  await screenshot('05-mobile.png');

  activeCheck = 'UI05';
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let repetition = 0; repetition < 3; repetition += 1) {
    await setTimes('11:00', '12:00');
    await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
    await setTimes('10:30', '11:30');
    await expect(page.getByRole('status')).toHaveText('Unavailable for 10:30–11:30');
  }
  const after = await timelineSnapshot();
  report.dataAfter = after;
  assert.deepEqual(after, before, 'Every existing timeline record must be preserved across every room');
  assert.deepEqual(await storageSnapshot(), storageBefore, 'Availability checks must not persist bookings');
  assert.equal(await page.getByRole('button', { name: /Confirm Booking/i }).count(), 0);
  assert.equal(await page.getByLabel('Booked By', { exact: true }).count(), 0);
  await selectRoom('A-102');
  await setTimes('11:00', '12:00');
  passed('UI05', 'Repeated available/unavailable checks preserve all five timeline records and browser storage; no booking submission controls exist.', {
    recordsBefore: Object.values(before).flat().length,
    recordsAfter: Object.values(after).flat().length,
    storageBefore,
    storageAfter: await storageSnapshot(),
  });
  await screenshot('06-data-preservation.png');
  activeCheck = 'RUNTIME';
  assert.deepEqual(report.consoleErrors, []);
  passed('RUNTIME', 'No uncaught browser page errors occurred.');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.checks.push({ id: activeCheck || 'LAUNCH', status: 'failed', error: error.stack || String(error) });
  log.push(`FAIL ${activeCheck || 'LAUNCH'}: ${error.stack || error}`);
  console.error(log.at(-1));
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  report.total = report.checks.length;
  report.passed = report.checks.filter((check) => check.status === 'passed').length;
  report.failed = report.checks.filter((check) => check.status === 'failed').length;
  writeFileSync(path.join(results, 'playwright-ui-results.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(results, 'playwright-ui-output.txt'), [
    report.command,
    `URL: ${report.url}`,
    `Chrome: ${report.browserVersion || 'not launched'}`,
    ...log,
    `TOTAL ${report.total}; PASSED ${report.passed}; FAILED ${report.failed}`,
  ].join('\n') + '\n');
  console.log(`TOTAL ${report.total}; PASSED ${report.passed}; FAILED ${report.failed}`);
  await browser?.close();
}
