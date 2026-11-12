import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const repo=path.resolve(fileURLToPath(new URL('../..',import.meta.url)));
const base=path.join(repo,'practice10');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const checks=[];
const check=(id,fn)=>{fn();checks.push({id,status:'passed'});console.log('PASS '+id);};
function snapshot(dir){
 const result={}; function walk(d){for(const f of readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else result[path.relative(dir,p)]=sha(p);}}
 walk(dir);return result;
}
check('T10-01 exact approved patch contents',()=>{
 const manifest=JSON.parse(readFileSync(path.join(base,'proposals/manifest.json')));
 for(const group of manifest)for(const file of group.files)assert.equal(sha(path.join(repo,file)),sha(path.join(base,'proposals/after',file)));
});
check('T10-02 preserve application source, fixtures and previous unit suites',()=>{
 const m=JSON.parse(readFileSync(path.join(base,'evidence/baseline/tracked-source-manifest.json')));
 for(const f of m.filter(f=>f.path.startsWith('src/')||f.path.startsWith('tests/')&&f.path!=='tests/practice09-browser.mjs'||['package.json','package-lock.json','vitest.config.ts','vite.config.ts'].includes(f.path)))assert.equal(sha(path.join(repo,f.path)),f.sha256,f.path);
});
check('T10-03 runner assertions preserved; only output-directory option changed',()=>{
 const before=execFileSync('git',['show','2857ed1:tests/practice09-browser.mjs'],{cwd:repo,encoding:'utf8'});
 const expected=before.replace('const submission = path.resolve(project, `practice09/evidence/ui-${phase}`);','const submission = path.resolve(project,\n  process.env.PRACTICE09_EVIDENCE_DIR || `practice09/evidence/ui-${phase}`);');
 assert.equal(readFileSync(path.join(repo,'tests/practice09-browser.mjs'),'utf8'),expected);
});
check('T10-04 new output directory contains the successful real browser run',()=>{
 const r=JSON.parse(readFileSync(path.join(base,'evidence/after/ui/playwright-ui-results.json')));
 assert.equal(r.status,'passed');assert.equal(r.passed,18);assert.equal(r.failed,0);assert.equal(r.url,'http://127.0.0.1:5180');
});
check('T10-05 rerun refuses to overwrite new evidence',()=>{
 const dir=path.join(base,'evidence/after/ui'), before=snapshot(dir);
 const r=spawnSync(process.execPath,['tests/practice09-browser.mjs','after'],{cwd:repo,env:{...process.env,PRACTICE09_URL:'http://127.0.0.1:5180',PRACTICE09_EVIDENCE_DIR:'practice10/evidence/after/ui'},encoding:'utf8'});
 assert.equal(r.status,1);assert.match(r.stderr,/Evidence already exists/);assert.deepEqual(snapshot(dir),before);
 writeFileSync(path.join(base,'evidence/after/custom-directory-refusal.txt'),r.stdout+r.stderr);
});
check('T10-06 default historical evidence remains protected',()=>{
 const dir=path.join(repo,'practice09/evidence/ui-after'),before=snapshot(dir),env={...process.env};delete env.PRACTICE09_EVIDENCE_DIR;
 const r=spawnSync(process.execPath,['tests/practice09-browser.mjs','after'],{cwd:repo,env,encoding:'utf8'});
 assert.equal(r.status,1);assert.match(r.stderr,/Evidence already exists/);assert.deepEqual(snapshot(dir),before);
 writeFileSync(path.join(base,'evidence/after/default-directory-refusal.txt'),r.stdout+r.stderr);
});
check('T10-07 workflow structure, safe permissions and shell syntax',()=>{
 const require=createRequire(path.join(repo,'package.json')),yaml=require('yaml');
 const a=yaml.parse(readFileSync(path.join(repo,'.github/workflows/verify.yml'),'utf8'));
 assert.deepEqual(a.permissions,{contents:'read'});assert.ok(a.on.pull_request!==undefined);assert.ok(!('pull_request_target' in a.on));
 assert.equal(a.jobs.verify.steps.length,12);assert.equal(a.jobs.verify.steps[0].with['persist-credentials'],false);
 for(const s of a.jobs.verify.steps){if(s.run)execFileSync('/bin/bash',['-n'],{input:s.run});if(s.uses)assert.match(s.uses,/@[a-f0-9]{40}$/);}
 for(const cmd of ['npm ci','npm test','npm run test:legacy','npm run typecheck','npm run lint','npm run build'])assert.ok(a.jobs.verify.steps.some(s=>s.run===cmd),cmd);
});
writeFileSync(path.join(base,'evidence/after/mitigation-regressions.json'),JSON.stringify({checks,passed:checks.length,failed:0,scope:'Local mitigation-specific checks; not a hosted CI execution'},null,2)+'\n');
console.log(`TOTAL ${checks.length}; PASSED ${checks.length}; FAILED 0`);
