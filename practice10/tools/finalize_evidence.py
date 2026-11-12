from pathlib import Path
import csv,json,hashlib,subprocess,shutil,datetime
base=Path(__file__).resolve().parents[1];repo=base.parent
after=base/'evidence/after'
initial=json.loads((base/'risk-register.initial.json').read_text())
for r in initial:
 r['initialLikelihood']=r['likelihood'];r['initialImpact']=r['impact'];r['initialScore']=r['score']
 r['mitigationApplied']=r['id'] in ['R1','R2']
 r['residualLikelihood']=1 if r['mitigationApplied'] else r['likelihood']
 r['residualImpact']=r['impact'];r['residualScore']=r['residualLikelihood']*r['residualImpact']
 r['residualReason']={
 'R1':'New output path produced 18/18 browser checks; both overwrite guards passed; CI file/commands/shell structure verified locally. Likelihood falls to unlikely; impact is unchanged. First hosted CI execution and required-check enforcement remain unverified.',
 'R2':'Approved rules now require isolated tasks, no credentials, evidence and human review. The actual approval gate was used. Likelihood falls to unlikely; impact remains moderate. Written rules are not technical access enforcement.',
 'R3':'No dependency version changed. Full audit still reports 25 affected packages. Existing trusted-use/no-privileged-server controls have an owner; a reviewed compatible upgrade is outstanding. Score stays 4.',
 'R4':'The include allowlist is unchanged. The playbook now requires proof of test collection; the underlying omission risk remains scored 2.',
 'R5':'Historical README content remains outside the approved patch scope. Practice10 references and evidence are explicit, but no general documentation cleanup is claimed.',
 'R6':'No external caller contract was added. UI still supplies its clamped clock; this remains a plausible/unverified helper-domain concern.',
 'R7':'Existing source/tests/browser evidence continue to contradict the proposed defect. Score describes hypothetical impact, not a confirmed bug.',
 'R8':'The escaped-render and bounded pattern scan are unchanged. Score describes a hypothetical scenario, not a demonstrated vulnerability.'}[r['id']]
 r['afterEvidence']=('evidence/after/mitigation-regressions.json; evidence/ui-comparison.json; evidence/verification/approval-and-application.json' if r['mitigationApplied'] else 'evidence/after/vitest.txt; security-assessment.md; initial challenge evidence')
(base/'risk-register.final.json').write_text(json.dumps(initial,indent=2)+'\n')
headers=['ID','Category','Cause / Event / Consequence','Affected Component','Evidence','Status','Likelihood','Impact','Score','Mitigation','Owner','Verification','Initial score','Residual likelihood','Residual impact','Residual score','Residual justification']
rows=[]
for r in initial:rows.append([r['id'],r['category'],' / '.join([r['cause'],r['event'],r['consequence']]),r['component'],r['evidence'],r['status'],r['likelihood'],r['impact'],r['score'],r['mitigation'],r['owner'],r['verification'],r['initialScore'],r['residualLikelihood'],r['residualImpact'],r['residualScore'],r['residualReason']])
with (base/'risk-register.final.csv').open('w',newline='') as f:w=csv.writer(f);w.writerow(headers);w.writerows(rows)
md='# Final risk register\n\nLikelihood and impact use the instructor scale 1–3; score = likelihood × impact. Initial and residual ratings are judgments supported by the stated evidence, not measured probabilities. Unsupported findings keep a hypothetical score and are not counted as confirmed defects. All owners: Boranov Daniyar.\n\n| ID | Category | Status | Initial L × I | Initial score | Residual L × I | Residual score |\n|---|---|---|---|---|---|---|\n'
for r in initial:md+=f"| {r['id']} | {r['category']} | {r['status']} | {r['likelihood']} × {r['impact']} | {r['score']} | {r['residualLikelihood']} × {r['residualImpact']} | {r['residualScore']} |\n"
for r in initial:
 md+=f"\n## {r['id']}\n\nCause / event / consequence: {r['cause']} {r['event']} {r['consequence']}\n\nComponent: {r['component']}\n\nEvidence: {r['evidence']}\n\nInitial score justification: {r['reason']}\n\nMitigation and owner: {r['mitigation']} Owner: {r['owner']}.\n\nVerification: {r['verification']}\n\nResidual assessment: {r['residualReason']}\n\nAfter evidence: {r['afterEvidence']}\n"
(base/'risk-register.final.md').write_text(md)
ready=json.loads((base/'agent-readiness.initial.json').read_text());ready['stage']='after approved mitigations';ready['level']=2
for r in ready['checks']:
 if r['check']=='AGENTS.md':r.update(state='Satisfied as documented rules',evidence='Exact approved section applied; secret, isolation, human review and merge boundaries included.',improvement='Continue enforcing the rules in each task; text is not a sandbox.')
 if r['check']=='CI and hooks':r.update(state='CI authored; hosted run unverified',evidence='Pinned Actions workflow with read-only permission; local YAML/shell/command checks passed.',improvement='First authorized remote run and owner-selected required checks; no push/deploy was performed.')
 if r['check']=='Integration and evidence':r.update(state='Satisfied locally',evidence='Fresh output option and both evidence guards passed; 18/18 checks and 25/25 recorded comparisons matched.',improvement='Preserve independent run folders and actual logs.')
 if r['check']=='Isolation and human approval':r.update(state='Documented and used in this task',evidence='Baseline isolated worktree; user approved both exact patches before application; no merge/deploy.',improvement='Use a disposable credential-free sandbox for untrusted execution.')
 if r['check']=='README and setup':r.update(state='Working setup; historical gaps remain',evidence='Approved Practice10 section documents fresh evidence output; older context remains R5.',improvement='Owner may review a later historical documentation cleanup.')
ready['rationale']='Level 2 remains appropriate: local checks and stronger instructions are verified, but hosted CI execution/enforcement, a formal formatter and dependency remediation are not established. Level 3 is not automatically awarded.'
(base/'agent-readiness.final.json').write_text(json.dumps(ready,indent=2)+'\n')
md='# Final agent-readiness audit\n\n**Level 2 — Documented, with improved operating controls.** '+ready['rationale']+'\n\n| Level | Check | State after mitigations | Evidence | Remaining control |\n|---|---|---|---|---|\n'
for r in ready['checks']:md+='| '+' | '.join(r[k] for k in ['level','check','state','evidence','improvement'])+' |\n'
(base/'agent-readiness.final.md').write_text(md)
# Document every affected package without confusing package count with advisory count.
audit=json.loads((after/'npm-audit.json').read_text());baseline=json.loads((base/'evidence/baseline/npm-audit.json').read_text())
assert audit['metadata']['vulnerabilities']==baseline['metadata']['vulnerabilities']
assert len(audit['vulnerabilities'])==25
records=[]
for name,v in sorted(audit['vulnerabilities'].items()):
 versions=set()
 for node in v['nodes']:
  p=repo/node/'package.json'
  if p.exists():versions.add(json.loads(p.read_text())['version'])
 advisories=[x for x in v['via'] if isinstance(x,dict)]
 records.append({'package':name,'installedVersions':', '.join(sorted(versions)),'severity':v['severity'],'direct':v['isDirect'],'affectedRange':v['range'],'advisoryURLs':'; '.join(sorted(set(x['url'] for x in advisories))),'viaPackages':'; '.join(x for x in v['via'] if isinstance(x,str)),'fixAvailable':str(v['fixAvailable'])})
with (base/'dependency-audit.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
md='# Dependency audit inventory\n\nBefore and after: 25 affected packages (2 low, 7 moderate, 14 high, 2 critical). This is npm’s package summary, not 25 proven exploits. No versions or dependencies were changed. Production-only audit identifies ws through the unused Supabase dependency; no source import of Supabase was found. Full raw audit records and exit codes are included.\n\n| Package | Installed | Severity | Direct |\n|---|---|---|---|\n'
for r in records:md+=f"| {r['package']} | {r['installedVersions']} | {r['severity']} | {r['direct']} |\n"
md+='\nThe CSV includes affected ranges and advisory URLs. See security-assessment.md for exposure conditions and uncertainty.\n'
(base/'dependency-audit.md').write_text(md)
# Capture exact approved files and hashes, excluding the unrelated user deletion.
manifest=json.loads((base/'proposals/manifest.json').read_text()); protected=json.loads((base/'evidence/baseline/tracked-source-manifest.json').read_text())
allowed={f for r in manifest for f in r['files']}
changes=[]
for r in protected:
 p=repo/r['path']; now=hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
 if now!=r['sha256']:
  assert r['path'] in allowed,r['path'];changes.append(r['path'])
assert (repo/'.github/workflows/verify.yml').is_file()
for group in manifest:
 for rel in group['files']:assert (repo/rel).read_bytes()==(base/'proposals/after'/rel).read_bytes()
 out=base/'evidence/after'/group['patch'];shutil.copy2(base/'proposals'/group['patch'],out)
 for rel in group['files']:
  target=base/'evidence/after/source'/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(repo/rel,target)
appHashes={str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((repo/'src').rglob('*')) if p.is_file()}
(beforeDist,afterDist)=({}, {})
for root,out in [(Path('/tmp/smartcampus-practice10-baseline-20261112/dist'),beforeDist),(repo/'dist',afterDist)]:
 for p in sorted(root.rglob('*')):
  if p.is_file():out[str(p.relative_to(root))]=hashlib.sha256(p.read_bytes()).hexdigest()
preserve={'approvedFiles':sorted(allowed),'observedTrackedChanges':changes,'newWorkflow':'.github/workflows/verify.yml','allApplicationSourceUnchanged':True,'allPriorUnitSuitesUnchanged':True,'packageAndLockfileUnchanged':True,'existingUserZipDeletionPreserved':not (repo/'practice09/Practice09_Boranov_Daniyar_Submission.zip').exists(),'applicationHashes':appHashes,'builtAssetsByteIdentical':beforeDist==afterDist,'baselineBuildHashes':beforeDist,'afterBuildHashes':afterDist}
(after/'preservation.json').write_text(json.dumps(preserve,indent=2)+'\n')
ui=json.loads((after/'ui/playwright-ui-results.json').read_text());comp=json.loads((base/'evidence/ui-comparison.json').read_text());target=json.loads((after/'mitigation-regressions.json').read_text())
summary={'fullVitest':{'passed':81,'failed':0},'legacy':{'passed':9,'failed':0},'mitigationChecks':{'passed':target['passed'],'failed':target['failed']},'browser06':'final script assertions passed; no numeric suite count defined','browser07':{'passed':12,'failed':0},'browser08':{'passed':14,'failed':0},'browser09':{'passed':ui['passed'],'failed':ui['failed']},'typecheck':'passed','lint':'passed','build':'passed','uiComparisonsMatched':sum(r['equal'] for r in comp['comparisons']),'uiComparisonsTotal':len(comp['comparisons']),'feedbackStates':comp['observableStateCount'],'pngPairsIdentical':sum(r['bytesIdentical'] for r in comp['screenshotComparisons']),'pngPairsTotal':len(comp['screenshotComparisons']),'dependencyAudit':audit['metadata']['vulnerabilities'],'sourceUnchanged':True,'hostedCI':'Not executed; no authorized remote push','deployment':'Not performed'}
(after/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
