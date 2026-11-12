import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const require=createRequire(import.meta.url), yaml=require('yaml');
const repo='/Users/daniarboranov/Documents/code_materials/se/boltprcproject/boltnewproject';
const p=repo+'/practice10/proposals/after/.github/workflows/verify.yml';
const a=yaml.parse(readFileSync(p,'utf8'));
if(a.permissions.contents!=='read'||a.jobs.verify.steps.length!==12)throw Error('workflow structure');
console.log('PASS workflow YAML parses; contents read; twelve steps; PR, main push and manual triggers');
for(const step of a.jobs.verify.steps){
 if(!step.run)continue;
 execFileSync('/bin/bash',['-n'],{input:step.run});
}
console.log('PASS bash syntax for all proposed run blocks; run blocks were not executed');
execFileSync(process.execPath,['--check',repo+'/practice10/proposals/after/tests/practice09-browser.mjs']);
console.log('PASS proposed browser script JavaScript syntax');
for(const name of ['01-repeatable-verification.patch','02-agent-boundaries.patch']){
 execFileSync('git',['apply','--check',repo+'/practice10/proposals/'+name],{cwd:repo});
 console.log('PASS git apply --check '+name+'; patch not applied');
}
