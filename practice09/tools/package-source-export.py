from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,platform,subprocess,tempfile,zipfile,time,re

root=Path(__file__).resolve().parents[2]
out=root/'practice09'
evidence=out/'evidence'/'regression'
evidence.mkdir(parents=True,exist_ok=True)
archive=out/'SmartCampus_Source_Export.zip'
fixed=['.gitignore','AGENTS.md','README.md','package.json','package-lock.json','index.html','eslint.config.js','postcss.config.js','tailwind.config.js','tsconfig.json','tsconfig.app.json','tsconfig.node.json','vite.config.ts','vitest.config.ts','vitest.original.config.ts','practice09/tools/compare-ui.mjs']
files=[root/f for f in fixed]
for directory in ['src','public','tests']:
 folder=root/directory
 if folder.exists(): files.extend(p for p in folder.rglob('*') if p.is_file() and p.name!='.DS_Store')
files=sorted(set(files))
for p in files:
 if not p.is_file():raise RuntimeError(f'Required source missing: {p}')
entries=[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,p.relative_to(root))
extract=Path(tempfile.mkdtemp(prefix='practice09-clean-export-'))
with zipfile.ZipFile(archive) as z:
 actual=z.namelist()
 if actual!=[e['path'] for e in entries]:raise RuntimeError('ZIP manifest mismatch')
 z.extractall(extract)
 if z.testzip() is not None:raise RuntimeError('Corrupt ZIP member')
for entry in entries:
 content=(extract/entry['path']).read_bytes()
 if hashlib.sha256(content).hexdigest()!=entry['sha256']:raise RuntimeError('Extracted hash mismatch')
for p in (extract/'.git',extract/'node_modules',extract/'dist'):
 if p.exists():raise RuntimeError(f'Forbidden export content {p}')

def run(label,argv):
 start=datetime.now(timezone.utc).isoformat()
 timer=time.monotonic()
 completed=subprocess.run(argv,cwd=extract,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 output=completed.stdout
 (evidence/(label+'.txt')).write_text(output)
 meta={'command':argv,'commandDisplay':' '.join(argv),'cwd':str(extract),'startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-timer,3),'exitCode':completed.returncode,'output':str((evidence/(label+'.txt')).relative_to(root))}
 (evidence/(label+'.meta.json')).write_text(json.dumps(meta,indent=2)+'\n')
 print(json.dumps(meta),flush=True)
 print(output,flush=True)
 return meta
versions={name:subprocess.check_output([name,'--version'],text=True).strip() for name in ['node','npm']}
install=run('clean-export-npm-ci',['npm','ci'])
if install['exitCode']!=0:
 tests={'status':'not run because npm ci failed'}
else:
 tests=run('clean-export-vitest',['npx','vitest','run'])
# Check the portable Git reader directly from the exported script without launching UI.
reader=(extract/'tests/practice09-browser.mjs').read_text()
start=reader.index('function readGitHead() {')
end=reader.index('\nconst report = {',start)
check="import {existsSync} from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process'; const project="+json.dumps(str(extract))+"; "+reader[start:end]+"; console.log(JSON.stringify({gitHead:readGitHead()}));"
portable=subprocess.run(['node','--input-type=module','-e',check],cwd=extract,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
(evidence/'clean-export-portable-git.txt').write_text(portable.stdout+portable.stderr)
if portable.returncode!=0 or json.loads(portable.stdout).get('gitHead','unexpected') is not None or portable.stderr:
 raise RuntimeError('Portable no-git metadata check failed')
# Verify current application and fixture sources have not moved while export/checks ran.
current_match=all(hashlib.sha256((root/e['path']).read_bytes()).hexdigest()==e['sha256'] for e in entries)
manifest={
 'createdAt':datetime.now(timezone.utc).isoformat(),'archive':str(archive.relative_to(root)),
 'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archiveBytes':archive.stat().st_size,
 'rootLayout':'Application files at ZIP root; extract into an empty directory.',
 'fileCount':len(entries),'files':entries,'allCurrentSourceHashesMatchArchive':current_match,
 'excluded':['node_modules/','.git/','dist/','.bolt/','secrets and .env files','OS metadata and caches','Practice08_Codex_Starter/','Practice08_Boranov_Daniyar_Submission/','practice08/ historical artifacts','practice09/ evidence and reports (except requested compare-ui.mjs tool)','bug-detector/ and bug-detector.zip'],
 'freshInstall':{'status':'passed' if install['exitCode']==0 else 'failed','metadata':install},
 'fullVitest':{'status':'passed' if tests.get('exitCode')==0 else 'failed or unavailable','metadata':tests,'passedTests':int(re.search(r'Tests\s+(\d+) passed', (evidence/'clean-export-vitest.txt').read_text()).group(1)) if tests.get('exitCode')==0 else None,'passedTestFiles':int(re.search(r'Test Files\s+(\d+) passed', (evidence/'clean-export-vitest.txt').read_text()).group(1)) if tests.get('exitCode')==0 else None},
 'versions':versions,'extractedDirectory':str(extract),
 'portableGitMetadata':{'status':'passed','gitHead':None,'stderr':'','command':'Extract readGitHead from exported browser script; execute in Node without a .git directory.'},
 'notes':['Root README is preserved unchanged, including references to historical assignment artifacts excluded from this source-only export.','Installed Google Chrome is needed for optional browser checks; no browser suite was rerun during this export check.']
}
for dest in [out/'source-export-manifest.json',evidence/'source-export-manifest.json']:
 dest.write_text(json.dumps(manifest,indent=2)+'\n')
print('SOURCE_EXPORT_COMPLETE '+str(archive),flush=True)
if not current_match or install['exitCode']!=0 or tests.get('exitCode')!=0:raise SystemExit(1)
