import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const root = path.join(project, 'practice08/evidence');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const views = [
  { input: 'skill/zip-inspection.txt', output: 'skill/zip-structure.png', title: 'Actual bug detector ZIP inspection', command: 'python zipfile inspection and unzip -l bug-detector.zip' },
  { input: 'baseline/practice07-original.txt', output: 'baseline/practice07-original-browser-view.png', title: 'Practice07 original baseline test output', command: 'npm run test:original' },
  { input: 'bug-a/red-targeted.txt', output: 'bug-a/red-targeted-browser-view.png', title: 'BUG A actual failing test output', command: 'See associated metadata for exact command' },
  { input: 'bug-b/red-targeted.txt', output: 'bug-b/red-targeted-browser-view.png', title: 'BUG B actual failing test output', command: 'See associated metadata for exact command' },
];
const browser = await chromium.launch({channel: 'chrome', headless: true});
const page = await browser.newPage({viewport: {width: 1400, height: 400}, deviceScaleFactor: 1});
const captures = [];
for (const item of views) {
  const input = path.join(root, item.input);
  if (!existsSync(input)) continue;
  const raw = readFileSync(input, 'utf8');
  const extra = item.input.startsWith('skill/') ? '\n\nActual command: unzip -l bug-detector.zip\n' + execFileSync('unzip', ['-l', path.join(project, 'bug-detector.zip')], {encoding: 'utf8'}) : '';
  const output = path.join(root, item.output);
  mkdirSync(path.dirname(output), {recursive: true});
  const htmlPath = output.replace(/\.png$/, '.html');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(item.title)}</title><style>body{font:18px Arial,sans-serif;color:#111;background:#fff;margin:35px}h1{font-size:28px;margin:0 0 12px}p{margin:8px 0}pre{font:15px/1.5 Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:22px;border:1px solid #aaa;background:#f6f7f8}small{font-size:15px}</style></head><body><h1>${escape(item.title)}</h1><p>Browser evidence viewer of actual saved output. This is not a terminal screenshot.</p><p><strong>Source:</strong> practice08/evidence/${escape(item.input)}</p><p><strong>Run:</strong> ${escape(item.command)}</p><pre>${escape(raw + extra)}</pre></body></html>`;
  writeFileSync(htmlPath, html);
  await page.goto(pathToFileURL(htmlPath).href, {waitUntil:'load'});
  await page.screenshot({path: output, fullPage: true});
  captures.push({source:item.input, screenshot:item.output, html:path.relative(root,htmlPath), browser:browser.version()});
  console.log('CAPTURED ' + item.output);
}
writeFileSync(path.join(root, 'ui/evidence-viewer-captures.json'), JSON.stringify(captures,null,2)+'\n');
await browser.close();
