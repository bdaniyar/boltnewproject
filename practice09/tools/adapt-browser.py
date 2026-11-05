from pathlib import Path
p=Path('tests/practice08-browser.mjs')
s=p.read_text().replace("import { mkdirSync, writeFileSync } from 'node:fs';", "import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';\nimport { createHash } from 'node:crypto';\nimport { execFileSync } from 'node:child_process';")
s=s.replace('5174', '5176').replace('practice08-browser.mjs', 'practice09-browser.mjs before').replace("const submission = path.resolve(project, 'practice08/evidence/ui');", "const phase = process.argv[2];\nif (!['before', 'after'].includes(phase)) throw new Error('Usage: node tests/practice09-browser.mjs before|after');\nconst submission = path.resolve(project, `practice09/evidence/ui-${phase}`);\nif (existsSync(path.join(submission, 'playwright-ui-results.json'))) throw new Error(`Evidence already exists at ${submission}; preserve it before a new run.`);")
s=s.replace("  command: 'node tests/practice09-browser.mjs before',", "  command: `node tests/practice09-browser.mjs ${phase}`,\n  phase,\n  gitHead: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: project, encoding: 'utf8'}).trim(),\n  sourceHashes: Object.fromEntries(['src/components/BookingPanel.tsx', 'src/bookingLogic.ts', 'src/App.tsx'].map((file) => [file, createHash('sha256').update(readFileSync(path.join(project, file))).digest('hex')])),\n  observableStates: {},")
s=s.replace('process.env.PRACTICE08_URL', 'process.env.PRACTICE09_URL')
needle='async function setTimes(start, end) {'
helper='''async function observeState(id) {
  const status = page.getByRole('status');
  report.observableStates[id] = {
    start: await page.getByLabel('Start (HH:MM)', { exact: true }).inputValue(),
    end: await page.getByLabel('End (HH:MM)', { exact: true }).inputValue(),
    blocked: await page.getByLabel('Block selected room (demo)', { exact: true }).isChecked(),
    startInvalid: await page.getByLabel('Start (HH:MM)', { exact: true }).getAttribute('aria-invalid'),
    endInvalid: await page.getByLabel('End (HH:MM)', { exact: true }).getAttribute('aria-invalid'),
    status: await status.textContent(),
    statusClass: await status.getAttribute('class'),
    statusStyle: await status.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, backgroundColor: style.backgroundColor, borderColor: style.borderColor };
    }),
    messages: await status.locator('..').locator('ul li').allTextContents(),
  };
}
async function expectStatusColor(color) {
  await expect(page.getByRole('status')).toHaveClass(new RegExp(`border-${color}-200 bg-${color}-50 text-${color}-700`));
}
'''
s=s.replace(needle,helper+needle)
s=s.replace("  passed('UI01',", "  await observeState('endpoint-after');\n  passed('UI01',")
s=s.replace("  passed('UI02',", "  await expectStatusColor('amber');\n  await observeState('blocked-valid');\n  passed('UI02',")
s=s.replace("  await screenshot('03-unavailable.png');\n  await page.getByLabel", """  await screenshot('03-unavailable.png');

  activeCheck = 'BLOCKED-MALFORMED-START';
  await setTimes('bad', '12:00');
  await expect(page.getByRole('status')).toHaveText('Unavailable — enter valid times');
  await expectStatusColor('rose');
  await expect(page.getByText('Enter a valid start time in HH:MM format (00:00–24:00).', { exact: true })).toBeVisible();
  await observeState('blocked-malformed-start');
  passed('BLOCKED-MALFORMED-START', 'Blocked room with malformed start preserves rose invalid-input feedback.');

  activeCheck = 'BLOCKED-MALFORMED-END';
  await setTimes('11:00', 'bad');
  await expect(page.getByRole('status')).toHaveText('Unavailable — enter valid times');
  await expectStatusColor('rose');
  await expect(page.getByText('Enter a valid end time in HH:MM format (00:00–24:00).', { exact: true })).toBeVisible();
  await observeState('blocked-malformed-end');
  passed('BLOCKED-MALFORMED-END', 'Blocked room with malformed end preserves rose invalid-input feedback.');

  activeCheck = 'BLOCKED-REVERSED';
  await setTimes('12:30', '12:00');
  await expect(page.getByRole('status')).toHaveText('Unavailable — room is blocked');
  await expectStatusColor('amber');
  await expect(page.getByText('Start time must be earlier than end time.', { exact: true })).toBeVisible();
  await expect(page.getByText('Room A-102 is currently blocked and cannot be booked.', { exact: true })).toBeVisible();
  await observeState('blocked-reversed');
  passed('BLOCKED-REVERSED', 'Blocked room with numeric reversed interval preserves amber blocked status and both validation messages.');
  await setTimes('11:00', '12:00');
  await page.getByLabel""")
s=s.replace("  passed('UI03',", "  await observeState('missing-start');\n  passed('UI03',")
s=s.replace("  activeCheck = 'AC1-PAST';", """  activeCheck = 'MALFORMED-END';
  await setTimes('11:00', 'bad');
  await expect(page.getByRole('status')).toHaveText('Unavailable — enter valid times');
  await expectStatusColor('rose');
  await expect(page.getByText('Enter a valid end time in HH:MM format (00:00–24:00).', { exact: true })).toBeVisible();
  await expect(page.getByLabel('End (HH:MM)', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await observeState('malformed-end');
  passed('MALFORMED-END', 'Unblocked room with malformed end preserves its format feedback and invalid state.');

  activeCheck = 'AC1-PAST';""")
s=s.replace("  passed('AC1-PAST',", "  await observeState('past');\n  passed('AC1-PAST',")
s=s.replace("  await setTimes('12:30', '12:00');\n  await expect(page.getByRole('status')).toHaveText('Unavailable for 12:30–12:00');", "  await observeState('zero-duration');\n  await setTimes('12:30', '12:00');\n  await expect(page.getByRole('status')).toHaveText('Unavailable for 12:30–12:00');")
s=s.replace("  passed('AC1-ORDER',", "  await observeState('reversed');\n  passed('AC1-ORDER',")
for name,key in [('INT01','duration-120'),('INT02','duration-121'),('INT03','endpoint-before'),('INT04','overlap')]:
 s=s.replace(f"  passed('{name}',",f"  await observeState('{key}');\n  passed('{name}',")
s=s.replace("  await screenshot('05-mobile.png');", """  await screenshot('05-mobile.png');
  await page.getByRole('heading', { name: 'Check Room Availability', exact: true }).evaluate((heading) => {
    const headerHeight = document.querySelector('header').getBoundingClientRect().height;
    window.scrollTo(0, window.scrollY + heading.getBoundingClientRect().top - headerHeight - 20);
  });
  await page.screenshot({path: path.join(shots, 'mobile-feedback-viewport.png'), fullPage: false});
  report.screenshots.push('mobile-feedback-viewport.png');""")
Path('tests/practice09-browser.mjs').write_text(s)
