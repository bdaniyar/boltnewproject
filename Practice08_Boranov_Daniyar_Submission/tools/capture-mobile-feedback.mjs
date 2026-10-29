import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:375,height:812}});
await page.goto('http://127.0.0.1:5174',{waitUntil:'networkidle'});
await page.getByLabel('Current hour',{exact:true}).fill('9');
await page.getByLabel('Current minute',{exact:true}).fill('0');
await page.getByRole('button',{name:/^A-102 /}).click();
await page.getByLabel('Start (HH:MM)',{exact:true}).fill('11:00');
await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:00');
await page.getByRole('heading',{name:'Check Room Availability',exact:true}).evaluate((heading)=>{const headerHeight=document.querySelector('header').getBoundingClientRect().height;window.scrollTo(0,window.scrollY+heading.getBoundingClientRect().top-headerHeight-20);});
await page.screenshot({path:'practice08/evidence/ui/mobile-feedback-viewport.png',fullPage:false});
const record={
  purpose:'Capture only; does not add checks or pass claims to the preserved 14-check UI run.',
  capturedAt:new Date().toISOString(),url:page.url(),browser:browser.version(),viewport:{width:375,height:812},
  currentHour:await page.getByLabel('Current hour',{exact:true}).inputValue(),
  currentMinute:await page.getByLabel('Current minute',{exact:true}).inputValue(),
  selectedSchedule:await page.getByRole('heading',{name:"Today's Schedule — A-102",exact:true}).textContent(),
  start:await page.getByLabel('Start (HH:MM)',{exact:true}).inputValue(),end:await page.getByLabel('End (HH:MM)',{exact:true}).inputValue(),
  status:await page.getByRole('status').textContent(),
  scrollY:await page.evaluate(()=>window.scrollY),screenshot:'mobile-feedback-viewport.png'
};
writeFileSync('practice08/evidence/ui/mobile-feedback-capture.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
await browser.close();
