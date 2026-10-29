# Practice 08 defect log

The initial production booking logic was correct for both required defects. Both cases below were deliberately injected and repaired separately in fresh copies of the saved baseline. The production src/bookingLogic.ts remains byte-for-byte equal to baseline afcff636e723e7549f039ef688bf58b6ed9a7656.

| Test ID | Defect | Input fixed clock bookings request | Expected | Actual real output | Suspected cause | Confirmed root cause and code location | Evidence file | Regression status |
|---|---|---|---|---|---|---|---|---|
| P08-A01 endpoint after 10:00-11:00 remains available | BUG-A endpoint-only touching considered overlap | now540; A-102 unblocked; existing [600,660); request [660,720) | available, because the intervals share no occupied minute | unavailable; 1 failed, 5 filtered tests skipped | Inclusive boundary comparison | In controlled before-fix src/bookingLogic.ts:54 both comparisons use <=; equality 660<=660 returns a conflict | evidence/bug-a/red-targeted.txt, injected-defect.patch, diagnosis-before-patch.md | After restoring strict < comparisons: targeted1 passed,5 filtered; full66 passed |
| P08-B01 availability preserves the original unsorted bookings | BUG-B original array reordered | now540; A-102 unblocked; existing order later-2 [780,810), existing-1 [600,660); request [660,720) | available AND unchanged original array order values length and references | available assertion passes; deep equality fails because order becomes existing-1,later-2; 1 failed,5 filtered | In-place array write during availability lookup | In controlled before-fix src/bookingLogic.ts:114 existingBookings.sort writes into the caller array | evidence/bug-b/red-targeted.txt, injected-defect.patch, diagnosis-before-patch.md | After deleting unnecessary sort: targeted1 passed,5 filtered; full66 passed |

## Additional regression checks

P08-A02 checks touching before the booking. P08-A03 rejects a genuine overlap and checks conflict feedback. P08-B02 repeats successful and rejected checks and checks values, length and object references. P08-B03 uses frozen bookings on available, unavailable, blocked and invalid paths. Existing Practice07 suites add 60 tests; Practice08 adds six for a combined 66-test Vitest suite. Legacy Node tests are a separate nine-test suite.

## Evidence and isolation

Each case directory contains baseline-targeted, red-targeted, green-targeted and green-full logs, with exact commands, UTC timestamps, working directories and exit codes in adjacent .meta.json files. The original RED output bytes are preserved. before-fix, baseline and after-fix source snapshots, the tested regression file, injection and repair diffs are retained. case.json records the baseline archive SHA256 and independent temporary-copy path. BUG-A was repaired and fully tested before BUG-B was injected in a new copy.

The supplied bug-detector procedure was applied in this Codex workflow as a read instruction: reproduce, localize, separate hypothesis from evidence, propose a minimal patch before editing and verify regression. This is not proof of an installed ChatGPT or Claude Skill and is not either independent comparison response.

## Real debugging limitation

An early BUG-B diagnosis estimated the sort location as line120. Numbering the preserved file showed line114; the dated correction is retained in that diagnosis. Source inspection and actual failures were needed to correct the AI's location claim. The cause and one-line repair were unaffected.

## Repeat experiments

Use python3 practice08/tools/controlled_experiments.py red bug-a, then save a diagnosis-before-patch.md in that evidence directory and run the repair stage; repeat for bug-b. The tool uses a saved baseline ZIP and never writes to production booking source. When using the source export, provide --baseline /path/to/submission/evidence/baseline/SmartCampus_Baseline.zip. Tests resolve the real per-copy TypeScript source; installed dependencies are shared via a symlink. Re-running a stage writes new logs in its selected output folder, so use --evidence-root /new/output to retain the original evidence.
