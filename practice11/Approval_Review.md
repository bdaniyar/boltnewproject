# Practice Work 11 implementation and repairs for review

Candidate branch: practice11/explain-availability. Baseline: ab36a3a97aba212d072a102f5d8ae10e745ca5b0. The main working tree was clean at baseline. The candidate lives in a separate local worktree. Booking logic, fixtures, dependencies, and previous test files are unchanged.

The candidate adds a labeled mock explanation and a deterministic fallback beside the confirmed status. The feature contract and written flow are in this folder. The exact candidate source and test diff is evidence/implementation/implementation.patch. The prompt comparison uses six identical input scenarios and recommends the ordered prompt for a future model. It is a static comparison.

Fresh baseline: 81/81 Vitest, 9/9 legacy and 18/18 booking browser checks. Typecheck, lint and build passed. The original suite passed 17/17 separately and is included in the 81. Candidate: 104/104 Vitest (81 existing plus 23 new), 9/9 legacy, 18/18 booking browser checks and 7/7 feature browser checks. Typecheck, lint and build passed. Application screenshot evidence includes available, overlap, blocked, fallback under a simulated adapter failure, and mobile samples. Test_Cases_Candidate.csv records expected and observed results. The local mock uses an artificial 100 ms wait. The recorded click-to-assertion measurements include browser overhead and have zero paid model calls.

## Read-only review and challenge

| Finding | Severity | Classification | Evidence and disposition |
|---|---|---|---|
| R11-01 Keyboard focus moves to BODY when the button disables during loading | Medium | Confirmed | Reviewer and separate Chrome probe observed BUTTON before Enter and BODY after the result. Selected repair 01. |
| R11-02 The response validator accepts a two-own-field object using a hidden explanation property | Low | Confirmed | Chrome service probe observed one enumerable key, two own keys and source mock. The exact one-field contract calls for fallback. Selected repair 02. |
| R11-03 Runtime error collection only covers the first browser page | Low | Confirmed | Runner source lists three pages with one pageerror listener. B06 and B07 still assert their UI outcomes. The evidence limitation stays documented. |
| R11-04 Oversized raw text is serialized in the reset key | Low | Plausible / unverified | Source confirms serialization order. User-visible delay was not measured. The adapter input gate rejects overlong text. |
| R11-05 A changed rejection reason could retain an old explanation with the same key | Low | Unsupported in current flow | App has no changing booking source. B07 observed the old completion and the newer explanation remained visible. Reassess if bookings become dynamic. |

The original separate agent response and the independent observations are in evidence/review. No application or regression test was edited between preserving the candidate diff and recording the review.

## Two exact proposed repairs

1. proposals/01-preserve-keyboard-focus.patch. Disabled native controls lose focus when busy. Keep the button focusable through aria-disabled and rely on the existing synchronous pending guard for duplicate activation. The proposed B08 regression checks keyboard focus while busy and after completion, records one adapter start for two Enter presses, and checks the overlap status.
2. proposals/02-enforce-output-shape.patch. The old checks counted enumerable properties and tested a potentially non-enumerable explanation field. Count all own keys, and require the sole key to be explanation. The proposed E24 regression expects fallback for the observed two-field object. Approved sentence validation and every booking decision stay under the same constraints.

Both patches pass git apply --check. The product repairs and regression additions are pending approval. After approval, apply the reviewed fixes, run the new and existing suites and browser scenarios, refresh screenshots and write the final editable Word report and individual submission files.

The provided Bolt demo was rechecked in Chrome and returned HTTP 200. A-102 showed Unavailable for 10:30–11:30. The existing deployment did not have an Explain Availability button during verification.
