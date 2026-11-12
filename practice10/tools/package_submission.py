"""Prepare individual attachments and a clean source folder, without any archive."""
from pathlib import Path
import shutil,json,hashlib,subprocess
base=Path(__file__).resolve().parents[1];repo=base.parent
out=base/'Practice10_Boranov_Daniyar_Submission';out.mkdir(exist_ok=True)
attachments={
'Practice10_Boranov_Daniyar_Report.docx':'Practice10_Boranov_Daniyar_Report.docx',
'risk-register.final.csv':'Risk_Register.csv','risk-register.final.md':'Risk_Register.md','risk-register.final.json':'Risk_Register.json',
'agent-readiness.final.md':'Agent_Readiness_Audit.md','agent-readiness.final.json':'Agent_Readiness_Audit.json',
'dependency-audit.csv':'Dependency_Audit.csv','dependency-audit.md':'Dependency_Audit.md','security-assessment.md':'Security_Assessment.md',
'release-decision.md':'Release_Decision.md','background-agent-scenario.md':'Background_Agent_Scenario.md','changed-files.md':'Changed_Files.md','source-reference.md':'Source_Reference.md','Email_Draft.txt':'Email_Draft.txt'}
for src,dst in attachments.items():shutil.copy2(base/src,out/dst)
shutil.copy2(repo/'AGENTS.md',out/'AGENTS.md')
for n in ['01-repeatable-verification.patch','02-agent-boundaries.patch']:shutil.copy2(base/'proposals'/n,out/n)
for folder in ['baseline','after','review','verification']:
 for p in (base/'evidence'/folder).rglob('*'):
  if not p.is_file():continue
  dest=out/'Evidence'/p.relative_to(base/'evidence');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
shutil.copy2(base/'evidence/ui-comparison.json',out/'Evidence/ui-comparison.json')
shutil.copy2(base/'evidence/ui-comparison.txt',out/'Evidence/ui-comparison.txt')
for src,dst in [('baseline/ui/01-desktop.png','Desktop_Before.png'),('after/ui/01-desktop.png','Desktop_After.png'),('baseline/ui/mobile-feedback-viewport.png','Mobile_Before.png'),('after/ui/mobile-feedback-viewport.png','Mobile_After.png'),('verification/published/desktop-available.png','Published_Demo.png')]:
 dest=out/'Screenshots'/dst;dest.parent.mkdir(exist_ok=True);shutil.copy2(base/'evidence'/src,dest)
# The source folder includes only the application, tests and actual build/tool configuration.
source=out/'Source';source.mkdir(exist_ok=True)
tracked=subprocess.check_output(['git','ls-files'],cwd=repo,text=True).splitlines()
root_files=['package.json','package-lock.json','README.md','AGENTS.md','.gitignore','index.html','eslint.config.js','postcss.config.js','tailwind.config.js','tsconfig.json','tsconfig.app.json','tsconfig.node.json','vite.config.ts','vitest.config.ts','vitest.original.config.ts']
selected=sorted(set(root_files+[f for f in tracked if f.startswith(('src/','tests/','.bolt/','public/'))]+['.github/workflows/verify.yml']))
for rel in selected:
 p=repo/rel;assert p.is_file(),rel
 dest=source/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
source_manifest=[{'path':r,'sha256':hashlib.sha256((source/r).read_bytes()).hexdigest()} for r in selected]
(out/'Source_Manifest.json').write_text(json.dumps({'baselineCommit':'2857ed197bbc05296c6731fb458fa20a550913e8','state':'Baseline plus the two approved patches; no remote revision created','files':source_manifest},indent=2)+'\n')
(out/'README.txt').write_text('Software Engineering Practice Work 10\n\nThe editable Word report contains the essential register, audit, mitigation evidence, test results and release decision. Supporting items are individual files and folders; no ZIP/RAR or OneDrive link is used. The email draft remains unsent.\n\nSource/ is the tested application plus the two approved changes, without dependencies, caches or Git internals. Copy it to a separate working directory before installing. Run npm ci; npx vitest run; npm run test:legacy; npm run typecheck; npm run lint; npm run build. For browser verification start npm run dev -- --host 127.0.0.1 --port 5180 --strictPort, then run PRACTICE09_URL=http://127.0.0.1:5180 PRACTICE09_EVIDENCE_DIR=practice10/evidence/recheck node tests/practice09-browser.mjs after. Use a new output directory for each run.\n\nEvidence contains baseline and after logs, exact command/exit metadata, original AI review and targeted diagnostics. Historical browser adapters preserve original assertions while changing only their output destinations/local origin. The recorded test collection and evidence-overwrite diagnostic failures are intentional observations, not passing application tests.\n\nCONDITIONAL decision: known dependency advisories remain; hosted CI first execution/enforcement is not established. No push, merge or deployment was performed. The live demo was verified separately and is not claimed as the updated local build.\n')
for p in out.rglob('*'):
 if not p.is_file():continue
 assert p.suffix.lower() not in ['.zip','.rar','.7z','.pdf'],p
 assert not set(p.relative_to(out).parts)&{'node_modules','.git','dist','__pycache__','.cache'},p
 assert not p.name.startswith(('.env','~$')),p
print('Individual submission prepared:',out)
print('Clean source files:',len(selected))
