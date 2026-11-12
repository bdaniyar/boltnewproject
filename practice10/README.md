# Software Engineering Practice Work 10

Boranov Daniyar, 24B031718. Thursday, 14:00–17:00. 12 November 2026.

Both exact mitigation patches were explicitly approved by the user and applied. The four changed project files match their reviewed copies. Application source, fixtures, package/lockfile and earlier unit suites are unchanged. The existing user's deletion of the Practice09 ZIP is preserved.

Final decision: **CONDITIONAL**. Readiness: **Level 2**, with stronger operating controls. R1 and R2 fall from 4 to 2 after verification; known dependency risk R3 stays 4. The dependency audit still reports 25 affected packages (2 low, 7 moderate, 14 high, 2 critical). No dependency upgrade was made.

## Real verification

- Vitest: 81/81 passed, including original17, improved43, Practice08six and Practice09fifteen.
- Legacy Node: 9/9 passed.
- Mitigation checks: 7/7 passed.
- Browser: Practice07 12/12, Practice08 14/14, Practice09 18/18; earlier final browser script assertions passed.
- Typecheck, lint and build passed.
- Before/after recorded behavior: 25/25 comparisons matched, including14 feedback states.
- All application source and built assets are byte-identical to the baseline.

## Deliverables

`Practice10_Boranov_Daniyar_Report.docx` is the editable report. `Practice10_Boranov_Daniyar_Submission/` contains individual report, register, readiness audit, AGENTS, exact diffs, logs, screenshots, release decision, theoretical background-agent scenario, source reference and clean source folder. No submission ZIP is generated. `Email_Draft.txt` is an unsent draft; its Practice11 subject preserves the instructor's distinction from assignment Practice10.

The full audit and evidence remain under this practice10 directory. Initial review/proposals are retained as historical evidence; their pre-approval wording is not the final status. Final registers and assessment use `.final` in their names.

Hosted CI was not executed because there was no authorized remote push. No merge, deployment, publication or email was performed. The provided live demo was verified as an existing application; its deployed revision is not established as the new local source.
