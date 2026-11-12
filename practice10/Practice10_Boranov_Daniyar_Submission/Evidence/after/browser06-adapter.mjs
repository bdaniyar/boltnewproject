import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const phase=process.argv[2]||'final';
const out='/Users/daniarboranov/Documents/code_materials/se/boltprcproject/boltnewproject/practice10/evidence/after/browser06'; mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5180');
await page.getByRole('button',{name:/A-102/}).click();
await page.getByLabel('Start (HH:MM)',{exact:true}).fill('11:00');
await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:00');
const before=await page.locator('[title*="Lab Team"]').count();
const observations={phase,before};
if(phase==='v1'){
 await page.getByLabel('Booked By').fill('Regression Test');
 await page.getByRole('button',{name:'Confirm Booking'}).click();
 observations.confirmed=await page.getByText('Booking confirmed:',{exact:false}).count();
 observations.addedBookings=await page.locator('[title*="Regression Test"]').count();
 assert.equal(observations.addedBookings,1);
}else{
 assert.equal(await page.getByRole('button',{name:'Confirm Booking'}).count(),0);
 assert.equal(await page.getByLabel('Booked By').count(),0);
 assert.ok(await page.getByText('Available for 11:00–12:00',{exact:true}).count());
 for(let i=0;i<3;i++){
  await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:01');
  await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:00');
 }
 assert.equal(await page.locator('[title*="Lab Team"]').count(),before);
 observations.checkDoesNotAddBookings=true;
}
await page.getByLabel('Start (HH:MM)',{exact:true}).fill('abc');
observations.invalidFormatFeedback=await page.getByText(/Enter a valid start time/).count();
if(phase==='final'){
 assert.equal(observations.invalidFormatFeedback,1);
 await page.getByLabel('Start (HH:MM)',{exact:true}).fill('');
 assert.equal(await page.getByText(/Enter a valid start time/).count(),1);
 await page.getByLabel('Start (HH:MM)',{exact:true}).fill('12:00');
 await page.getByLabel('End (HH:MM)',{exact:true}).fill('14:01');
 assert.equal(await page.getByText(/Booking duration is 121 minutes/).count(),1);
 await page.getByLabel('End (HH:MM)',{exact:true}).fill('bad');
 assert.equal(await page.getByText(/Enter a valid end time/).count(),1);
 await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:00');
 observations.blankStartAndMalformedEndFeedback=true;
 observations.durationFeedback=true;
}
await page.getByLabel('Start (HH:MM)',{exact:true}).fill('11:00');
observations.widths=[];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 const size=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
 observations.widths.push(size);
 if(phase==='final'){
  assert.ok(size.scrollWidth<=width,JSON.stringify(size));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/${width===1440?'desktop':'mobile'}.png`,fullPage:true});
 }
}
observations.errors=errors;assert.deepEqual(errors,[]);
writeFileSync(`${out}/browser.json`,JSON.stringify(observations,null,2));
console.log(observations);
await browser.close();
