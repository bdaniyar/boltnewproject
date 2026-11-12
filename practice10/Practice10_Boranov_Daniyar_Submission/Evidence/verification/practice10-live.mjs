import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const out='/Users/daniarboranov/Documents/code_materials/se/boltprcproject/boltnewproject/practice10/evidence/verification/published';
mkdirSync(out,{recursive:true});
const report={url:'https://smart-campus-room-ch-50zs.bolt.host/',checkedAt:new Date().toISOString(),checks:[],deployedRevision:'Not established; no new deployment requested'};
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const response=await page.goto(report.url,{waitUntil:'networkidle'});
 report.httpStatus=response.status();report.title=await page.title();
 await expect(page.getByRole('heading',{name:'Smart Campus Room Checker',exact:true})).toBeVisible();
 report.checks.push('Smart Campus heading visible');
 await page.getByRole('button',{name:/^A-102 /}).click();
 await expect(page.getByRole('status')).toHaveText('Unavailable for 10:30–11:30');
 await expect(page.getByText('Overlaps existing booking by Lab Team 3 (10:00–11:00).',{exact:true})).toBeVisible();
 report.checks.push('A-102 overlap rejected');
 await page.screenshot({path:out+'/desktop-overlap.png',fullPage:true});
 await page.getByLabel('Start (HH:MM)',{exact:true}).fill('11:00');
 await page.getByLabel('End (HH:MM)',{exact:true}).fill('12:00');
 await expect(page.getByRole('status')).toHaveText('Available for 11:00–12:00');
 report.checks.push('A-102 touching endpoint accepted');
 await page.screenshot({path:out+'/desktop-available.png',fullPage:true});
 const scripts=await page.locator('script[src]').evaluateAll(es=>es.map(e=>e.src));
 report.scripts=[];
 for(const url of scripts){const r=await page.request.get(url);const b=await r.body();report.scripts.push({url,status:r.status(),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
 report.status='passed';
} catch(e){report.status='failed';report.error=String(e);process.exitCode=1;} finally {await browser.close();writeFileSync(out+'/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
