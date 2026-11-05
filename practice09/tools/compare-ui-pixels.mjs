import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const evidence=fileURLToPath(new URL('../evidence/',import.meta.url));
const comparison=JSON.parse(readFileSync(path.join(evidence,'ui-comparison.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const pixelResults=[];
for(const item of comparison.screenshotComparisons){
 const inputs=['before','after'].map((phase)=>'data:image/png;base64,'+readFileSync(path.join(evidence,`ui-${phase}`,item.screenshot)).toString('base64'));
 const result=await page.evaluate(async (inputs)=>{
  async function decode(src){const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);return {width:image.width,height:image.height,pixels:context.getImageData(0,0,image.width,image.height).data};}
  const [a,b]=await Promise.all(inputs.map(decode));
  if(a.width!==b.width||a.height!==b.height)return {sameDimensions:false,before:[a.width,a.height],after:[b.width,b.height]};
  let count=0,minX=a.width,minY=a.height,maxX=-1,maxY=-1;
  for(let i=0;i<a.pixels.length;i+=4){if(a.pixels[i]!==b.pixels[i]||a.pixels[i+1]!==b.pixels[i+1]||a.pixels[i+2]!==b.pixels[i+2]||a.pixels[i+3]!==b.pixels[i+3]){count++;const p=i/4,x=p%a.width,y=Math.floor(p/a.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
  return {sameDimensions:true,imageSize:[a.width,a.height],differentPixels:count,differenceBoundingBox:count?[minX,minY,maxX+1,maxY+1]:null};
 },inputs);
 pixelResults.push({screenshot:item.screenshot,...result});
}
await browser.close();
const report={command:'node practice09/tools/compare-ui-pixels.mjs',method:'Read original PNGs in Chrome canvas and compare every decoded RGBA pixel. Original screenshots are unchanged.',results:pixelResults};
writeFileSync(path.join(evidence,'ui-pixel-differences.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
