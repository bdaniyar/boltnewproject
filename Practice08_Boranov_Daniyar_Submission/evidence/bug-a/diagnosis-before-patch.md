# BUG A diagnosis before patch

Recorded at UTC: 2026-10-29T13:15:41.395020+00:00

This analysis was saved after the RED run and before changing the defective copy.

| defect | evidence | root cause | fix | test |
|---|---|---|---|---|
| BUG-A endpoint touching is rejected | red-targeted.txt: P08-A01 returns unavailable instead of available | Controlled src/bookingLogic.ts line 54 uses start <= b.end && b.start <= end, so equality is treated as overlap | Restore start < b.end && b.start < end in that one condition | P08-A01 must pass; P08-A02 must allow the other endpoint; P08-A03 must reject a genuine overlap |

## Reproduction and independent expected result

The supplied clock is 540 (09:00), the unblocked room is A-102, the existing booking is [600,660) (10:00-11:00), and the request is [660,720) (11:00-12:00). The request lasts 60 minutes and is after the clock. These half-open intervals share no occupied minute: 660 is excluded from the first interval. AC4 therefore requires available. The actual test returned unavailable.

## Hypothesis and confirmed explanation

The initial hypothesis was an inclusive endpoint condition. The preserved one-condition injection diff and the direct evaluation 660 <= 660 confirm the cause. No clock, blocked-room, duration, or mutation defect was injected. This is a controlled deliberate defect; the original repository already used strict comparisons.

## Proposed minimal repair before implementation

Replace the single condition at line 54 with `if (start < b.end && b.start < end)`. No other function or fixture needs to change. Next run the exact targeted test, then all original, improved and Practice08 tests. The diagnostic record makes no claim of a completed repair before those real runs.
