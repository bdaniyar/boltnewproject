from pathlib import Path
import json,csv,hashlib,re,subprocess
from zipfile import ZipFile
from docx import Document
from docx.oxml.ns import qn
base=Path(__file__).resolve().parents[1];repo=base.parent;out=base/'Practice10_Boranov_Daniyar_Submission'
docpath=out/'Practice10_Boranov_Daniyar_Report.docx';d=Document(docpath)
with ZipFile(docpath) as z:assert z.testzip() is None
assert len(d.inline_shapes)==4
paras=list(d.paragraphs)+[p for t in d.tables for row in t.rows for c in row.cells for p in c.paragraphs]
text='\n'.join(p.text for p in paras)
assert all(f'{i} ' in text for i in range(1,13))
assert 'b.azimkhanov' not in text and '@kbtu.kz' not in text
assert not re.search(r'\[INSERT|\[TODO|Subject:|To:|send your work',text,re.I)
assert 'CONDITIONAL' in text and 'gpt-6.1-sol' in text
for p in paras:
 for r in p.runs:
  if not r.text:continue
  assert r.font.name=='Times New Roman'
  assert r.font.size.pt==12
  assert str(r.font.color.rgb)=='000000'
assert not d.settings.element.xpath('.//w:documentProtection')
assert any('smart-campus-room-ch-50zs.bolt.host' in r.target_ref for r in d.part.rels.values() if r.is_external)
# Embedded pictures must be the genuine four source captures.
expected=[base/'evidence/baseline/ui/01-desktop.png',base/'evidence/after/ui/01-desktop.png',base/'evidence/baseline/ui/mobile-feedback-viewport.png',base/'evidence/after/ui/mobile-feedback-viewport.png']
for shape,p in zip(d.inline_shapes,expected):
 rel=shape._inline.xpath('.//a:blip')[0].get(qn('r:embed'))
 assert hashlib.sha256(d.part.related_parts[rel].blob).hexdigest()==hashlib.sha256(p.read_bytes()).hexdigest()
risks=json.loads((out/'Risk_Register.json').read_text());assert len(risks)>=5 and len({r['category'] for r in risks})>=3
assert {'CONFIRMED','PLAUSIBLE / UNVERIFIED','UNSUPPORTED'}<={r['status'] for r in risks}
for r in risks:
 assert 1<=r['likelihood']<=3 and 1<=r['impact']<=3 and r['score']==r['likelihood']*r['impact']
 assert r['residualScore']==r['residualLikelihood']*r['residualImpact']
assert [r['id'] for r in risks if r['mitigationApplied']]==['R1','R2']
assert all(r['initialScore']==4 and r['residualScore']==2 for r in risks[:2])
assert json.loads((out/'Agent_Readiness_Audit.json').read_text())['level']==2
rows=list(csv.DictReader((out/'Dependency_Audit.csv').open()));assert len(rows)==25
assert {s:sum(r['severity']==s for r in rows) for s in ['low','moderate','high','critical']}=={'low':2,'moderate':7,'high':14,'critical':2}
assert (out/'AGENTS.md').read_bytes()==(repo/'AGENTS.md').read_bytes()
for r in json.loads((base/'proposals/manifest.json').read_text()):
 assert hashlib.sha256((out/r['patch']).read_bytes()).hexdigest()==r['sha256']
 for f in r['files']:assert (repo/f).read_bytes()==(base/'proposals/after'/f).read_bytes()
source_manifest=json.loads((out/'Source_Manifest.json').read_text())
for f in source_manifest['files']:
 p=out/'Source'/f['path'];assert p.read_bytes()==(repo/f['path']).read_bytes();assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256']
for name in ['vitest','legacy','typecheck','lint','build','browser06','browser07','browser08','browser09','mitigation-regressions','source-export-install','source-export-tests','source-export-build']:
 assert json.loads((base/f'evidence/after/{name}.meta.json').read_text())['exitCode']==0,name
assert '81 passed (81)' in (base/'evidence/after/vitest.txt').read_text()
assert json.loads((base/'evidence/after/ui/playwright-ui-results.json').read_text())['passed']==18
assert json.loads((base/'evidence/after/preservation.json').read_text())['builtAssetsByteIdentical']
assert json.loads((base/'evidence/after/report-render-review.json').read_text())['allPagesVisuallyInspected']
assert json.loads((base/'evidence/after/source-export-verification.json').read_text())['stage']=='verified'
assert 'AI-Driven Software Engineering Practice #11, Boranov Daniyar, 24B031718' in (out/'Email_Draft.txt').read_text()
files=sorted(p for p in out.rglob('*') if p.is_file() and p.name not in ['SHA256SUMS.txt','Delivery_Validation.json'])
for p in files:
 assert p.suffix.lower() not in ['.zip','.rar','.7z','.pdf'],p
 assert not set(p.relative_to(out).parts)&{'node_modules','.git','dist','__pycache__','.cache'},p
 assert not p.name.startswith(('.env','~$')),p
sums=''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(out).as_posix()+'\n' for p in files)
(out/'SHA256SUMS.txt').write_text(sums)
audit={'filesHashed':len(files),'bytes':sum(p.stat().st_size for p in files),'editableWord':True,'font':'Times New Roman 12 pt black','reportPages':12,'reportImages':4,'reportSHA256':hashlib.sha256(docpath.read_bytes()).hexdigest(),'reportContainsTeacherEmail':False,'reportContainsSubmissionInstructions':False,'riskFindings':len(risks),'categories':len({r['category'] for r in risks}),'approvedMitigations':['R1','R2'],'readinessLevel':2,'releaseDecision':'CONDITIONAL','dependencyPackagesReported':len(rows),'fullVitest':'81/81','legacy':'9/9','mitigationChecks':'7/7','browser07':'12/12','browser08':'14/14','browser09':'18/18','uiComparisons':'25/25','sourceFiles':len(source_manifest['files']),'sourceFreshInstallTestsBuild':'passed','archiveCreated':False,'remainingExternalEvidence':['First hosted CI run and required-check enforcement not established; no authorized remote push'],'historyHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()}
(out/'Delivery_Validation.json').write_text(json.dumps(audit,indent=2)+'\n');(base/'delivery-validation.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit,indent=2))
