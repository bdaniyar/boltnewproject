"""Reproduce one deliberate defect at a time, without changing production source.

Usage: python3 practice08/tools/controlled_experiments.py red bug-a
       python3 practice08/tools/controlled_experiments.py repair bug-a
       python3 practice08/tools/controlled_experiments.py red bug-b
       python3 practice08/tools/controlled_experiments.py repair bug-b
Pass --baseline /path/to/SmartCampus_Baseline.zip when using the source export.
The full submission provides that archive in evidence/baseline/.
"""
import argparse
import datetime
import difflib
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
REFERENCE = 'afcff636e723e7549f039ef688bf58b6ed9a7656'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def diff(before, after, first, second):
    return ''.join(difflib.unified_diff(before.splitlines(True), after.splitlines(True), fromfile=first, tofile=second))


def run(copy, evidence, name, arguments):
    command = ['node', str(ROOT / 'node_modules/vitest/vitest.mjs'), 'run', *arguments]
    started = now()
    result = subprocess.run(command, cwd=copy, env=dict(os.environ, NO_COLOR='1', FORCE_COLOR='0'),
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (evidence / (name + '.txt')).write_bytes(result.stdout)
    (evidence / (name + '.meta.json')).write_text(json.dumps({
        'command': command, 'cwd': str(copy), 'startedAtUTC': started,
        'completedAtUTC': now(), 'exitCode': result.returncode,
    }, indent=2) + '\n')
    print(result.stdout.decode(), end='')
    return result.returncode


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('stage', choices=['red', 'repair'])
parser.add_argument('bug', choices=['bug-a', 'bug-b'])
parser.add_argument('--baseline', type=Path, default=ROOT / 'practice08/evidence/baseline/SmartCampus_Baseline.zip')
parser.add_argument('--evidence-root', type=Path, default=ROOT / 'practice08/evidence')
args = parser.parse_args()
evidence = args.evidence_root / args.bug
evidence.mkdir(parents=True, exist_ok=True)
case_file = evidence / 'case.json'

if args.stage == 'red':
    copy = Path(tempfile.mkdtemp(prefix='practice08-' + args.bug + '-'))
    with ZipFile(args.baseline) as archive:
        archive.extractall(copy)
    (copy / 'node_modules').symlink_to(ROOT / 'node_modules', target_is_directory=True)
    for relative in ['tests/practice08.regression.test.ts', 'vitest.config.ts']:
        (copy / relative).write_bytes((ROOT / relative).read_bytes())
    source = copy / 'src/bookingLogic.ts'
    baseline = source.read_text()
    assert baseline == (ROOT / 'src/bookingLogic.ts').read_text(), 'Production source must still equal baseline'
    test = 'P08-A01' if args.bug == 'bug-a' else 'P08-B01'
    assert run(copy, evidence, 'baseline-targeted', ['tests/practice08.regression.test.ts', '-t', test]) == 0
    if args.bug == 'bug-a':
        defective = baseline.replace('if (start < b.end && b.start < end)', 'if (start <= b.end && b.start <= end)')
    else:
        anchor = '  // Use the same validation for previews and form feedback so they cannot disagree.'
        defective = baseline.replace(anchor, '  existingBookings.sort((a, b) => a.start - b.start);\n' + anchor)
    assert defective != baseline
    source.write_text(defective)
    (evidence / 'bookingLogic.before-fix.ts').write_text(defective)
    (evidence / 'bookingLogic.baseline.ts').write_text(baseline)
    (evidence / 'practice08.regression.test.ts').write_bytes((ROOT / 'tests/practice08.regression.test.ts').read_bytes())
    (evidence / 'injected-defect.patch').write_text(diff(baseline, defective, 'baseline/src/bookingLogic.ts', args.bug + '/src/bookingLogic.ts'))
    assert run(copy, evidence, 'red-targeted', ['tests/practice08.regression.test.ts', '-t', test]) != 0
    case_file.write_text(json.dumps({
        'bug': args.bug, 'baselineGitSHA': REFERENCE, 'isolatedCopy': str(copy),
        'baselineArchiveSHA256': hashlib.sha256(args.baseline.read_bytes()).hexdigest(),
        'testID': test, 'stage': 'RED preserved before diagnosis and repair', 'recordedAtUTC': now(),
        'isolation': 'Fresh extraction of clean baseline; only one source defect; dependencies symlinked; tests and full-suite config copied in.',
    }, indent=2) + '\n')
    print('RED retained in', evidence, '; isolated copy', copy)
else:
    case = json.loads(case_file.read_text())
    copy = Path(case['isolatedCopy'])
    source = copy / 'src/bookingLogic.ts'
    defective = source.read_text()
    baseline = (evidence / 'bookingLogic.baseline.ts').read_text()
    assert defective == (evidence / 'bookingLogic.before-fix.ts').read_text()
    assert (evidence / 'diagnosis-before-patch.md').is_file(), 'Explain minimal patch before running repair'
    source.write_text(baseline)
    (evidence / 'bookingLogic.after-fix.ts').write_text(baseline)
    (evidence / 'minimal-repair.patch').write_text(diff(defective, baseline, args.bug + '/src/bookingLogic.ts', 'repaired/src/bookingLogic.ts'))
    assert run(copy, evidence, 'green-targeted', ['tests/practice08.regression.test.ts', '-t', case['testID']]) == 0
    assert run(copy, evidence, 'green-full', []) == 0
    case.update(stage='GREEN targeted and full after documented diagnosis', repairedAtUTC=now(),
                repairedSourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest())
    case_file.write_text(json.dumps(case, indent=2) + '\n')
    assert source.read_bytes() == (ROOT / 'src/bookingLogic.ts').read_bytes()
    print('Repair restored exact baseline code in isolated copy; production source unchanged.')
