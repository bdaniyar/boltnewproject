import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const response = await page.goto('https://smart-campus-room-ch-50zs.bolt.host/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Smart Campus Room Checker' })).toBeVisible();
  await page.getByRole('button', { name: /^A-102 / }).click();
  await expect(page.getByRole('status')).toHaveText('Unavailable for 10:30–11:30');
  console.log(JSON.stringify({ status: response.status(), title: await page.title(), bookingStatus: await page.getByRole('status').innerText(), explanationButtons: await page.getByRole('button', { name: 'Explain Availability' }).count() }));
} finally {
  await browser.close();
}
