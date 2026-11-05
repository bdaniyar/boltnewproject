# Software Engineering Practice Work 09

Student: Boranov Daniyar, 24B031718. Thursday, 14:00–17:00.

The editable Word report is `Practice09_Boranov_Daniyar_Report.docx`. The submission ZIP includes the root `AGENTS.md`, clean source export, regression evidence, real desktop/mobile screenshots, changed-file list, pattern rationale and an email draft. The assignment is Practice Work #09. The required submission email subject keeps the instructor's wording: `AI-Driven Software Engineering Practice #10, Boranov Daniyar, 24B031718`.

## Completed project work

The repository baseline was preserved before edits. Inspection identified the pure booking rules, React UI, five-room fixture catalogue and existing tests. Three genuine maintainability findings were recorded. The selected minimal change reuses the panel's existing validation result instead of validating the same input again. No new design pattern was introduced.

AC1–AC6 remain covered. The existing booking rules and fixtures are preserved. Desktop and mobile UI checks record the same booking feedback before and after the refactor.

## Verification results

- `npx vitest run`: 81/81 passed.
- Original tests: 17/17 passed.
- Practice08 regressions: 6/6 passed.
- Practice09 component regressions: 15/15 passed.
- Legacy Node tests: 9/9 passed.
- Typecheck, lint and build passed.
- Before and after browser suites: 18/18 checks each.
- Browser comparison: 25/25 recorded comparisons matched.
- Fresh source export: clean install and 81/81 Vitest tests passed.

## Published demo

Verified: <https://smart-campus-room-ch-50zs.bolt.host/>. In A-102, a 10:30–11:30 request displayed Unavailable because it overlaps the existing 10:00–11:00 booking. A request starting at 11:00 displayed Available.

## Evidence

- `evidence/baseline/`: frozen source, baseline test output and hashes.
- `evidence/inspection/`: source structure and maintainability findings.
- `evidence/implementation/`: before/after component, patch and preservation checks.
- `evidence/regression/`: real command outputs and run metadata.
- `evidence/ui-before/` and `evidence/ui-after/`: captured desktop and mobile browser states.
- `evidence/ui-comparison.json`: recorded before/after UI observations.

The test commands and output logs can be reproduced from the clean source export with the commands listed in the report. `Email_Draft.txt` preserves the assignment's requested recipient and subject.
