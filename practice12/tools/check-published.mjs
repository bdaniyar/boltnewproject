import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const url = 'https://smart-campus-room-ch-86qg.bolt.host/';
const output = process.argv[2] ?? 'practice12/evidence/code/published';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1360, height: 850 } });
try {
  const response = await page.goto(url);
  await expect(page.getByRole('heading', { name: /Smart Campus Room Checker/i })).toBeVisible();
  await page.getByRole('button', { name: /^A-102 / }).click();
  await page.getByLabel('Start (HH:MM)', { exact: true }).fill('11:00');
  await page.getByLabel('End (HH:MM)', { exact: true }).fill('12:00');
  await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
  const hasExplanation = await page.getByRole('button', { name: 'Explain Availability', exact: true }).isVisible();
  if (hasExplanation) {
    await page.getByRole('button', { name: 'Explain Availability', exact: true }).click();
    await expect(page.getByTestId('availability-explanation')).toContainText('Mock explanation');
  }
  await page.screenshot({ path: join(output, 'published-baseline.png') });
  await page.goto(new URL('?practice=12', url).href);
  await expect(page.getByRole('heading', { name: /Smart Campus/ }).first()).toBeVisible();
  const hasPractice12 = await page.getByRole('heading', { name: 'Smart Campus Availability', exact: true }).isVisible();
  const record = { checkedAt: new Date().toISOString(), url, status: response?.status(), bookingDecision: 'Available for 11:00–12:00', hasExplanation, hasPractice12 };
  await writeFile(join(output, 'verified.json'), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record));
} finally {
  await browser.close();
}
