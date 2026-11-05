"""Summarize measured evidence and file changes without altering source."""
import hashlib
import json
import pathlib
import subprocess

root = pathlib.Path(__file__).resolve().parents[2]
base = root / 'practice09'
modified = subprocess.check_output(['git', 'diff', '--name-only'], cwd=root, text=True).splitlines()
new_source = ['AGENTS.md', 'tests/practice09.refactoring.test.tsx', 'tests/practice09-browser.mjs']
descriptions = {
    'README.md': 'Document 81 tests, Practice09 commands and unavailable Bolt evidence.',
    'src/components/BookingPanel.tsx': 'Reuse liveValidation for status and remove duplicate validation memo/import.',
    'vitest.config.ts': 'Include the 15 focused component regressions.',
    'AGENTS.md': 'Add repository-specific constraints and verification instructions.',
    'tests/practice09.refactoring.test.tsx': 'Add 15 real-component and frozen-fixture characterization tests.',
    'tests/practice09-browser.mjs': 'Add preserved-evidence before/after browser checks and real feedback observations.',
}
lines = ['# Changed files', '', 'Baseline: a2dff221bb65eeee5d1b20211292ed5d020905bc. No history rewrite or commit was made.', '', '| File | Status | Reason |', '|---|---|---|']
for name in modified + new_source:
    lines.append(f'| `{name}` | {"Modified" if name in modified else "Added"} | {descriptions.get(name, "See source diff.")} |')
lines += ['', 'New practice09 files are assignment deliverables: report and source export, prompts, rationale, comparison, email draft, missing-evidence instructions, real raw evidence, manifests and reproducible helper scripts. QA renders and the full historical baseline archive remain local and are excluded from the submission.', '', 'No dependencies or lockfile changed. All other tracked source and all existing tests remain byte-identical to Git HEAD.']
(base/'changed-files.md').write_text('\n'.join(lines)+'\n')
patch = subprocess.check_output(['git','diff','--','README.md','src/components/BookingPanel.tsx','vitest.config.ts'], cwd=root)
(base/'evidence/implementation/working-source.patch').write_bytes(patch)
preserved = ['src/bookingLogic.ts','src/App.tsx','src/types.ts','src/sampleData.ts','tests/practice07.original.test.ts','tests/practice07.improved.test.ts','tests/practice08.regression.test.ts','tests/booking.test.mjs','package.json','package-lock.json']
rows = []
for name in preserved:
    old = subprocess.check_output(['git','show','HEAD:'+name], cwd=root)
    now = (root/name).read_bytes()
    rows.append({'file':name,'baselineSHA256':hashlib.sha256(old).hexdigest(),'currentSHA256':hashlib.sha256(now).hexdigest(),'unchanged':old==now})
assert all(row['unchanged'] for row in rows)
(base/'evidence/implementation/preservation-check.json').write_text(json.dumps(rows,indent=2)+'\n')
summary = {'baselineGit':'a2dff221bb65eeee5d1b20211292ed5d020905bc','baseline':{'vitest':66,'originalSubset':17,'practice08Subset':6,'legacy':9,'newCharacterizationOnBaseline':15,'browser':18},'after':{'vitest':81,'originalSubset':17,'practice08Subset':6,'practice09Subset':15,'legacy':9,'browser':18,'behaviourComparisons':25,'feedbackStates':14},'checks':[]}
for stem in ['original','practice08-regressions','refactoring','full-vitest','legacy','typecheck','lint','build','clean-export-npm-ci','clean-export-vitest']:
    p = base/'evidence/regression'/f'{stem}.meta.json'
    meta=json.loads(p.read_text())
    assert meta['exitCode']==0
    summary['checks'].append({'evidence':str(p.relative_to(base)),**meta})
(base/'evidence/verification-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print('Preservation:', len(rows), 'unchanged files; successful checks:',len(summary['checks']))
