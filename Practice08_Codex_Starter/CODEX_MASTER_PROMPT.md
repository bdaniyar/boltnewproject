# CODEX MASTER PROMPT — Software Engineering Lesson #08 / Practice Work #08

You are in my **existing Smart Campus Room Availability repository already open in my IDE**. This app comes from my Software Engineering Practice #06 and Practice #07. Work within the actual repository rather than generating a separate project. The instructor's Lesson #08 / Practice Work #08 presentation is summarized accurately below. My starter bundle contains `bug-detector/SKILL.md`, `bug-detector/agents/openai.yaml`, prompts, report outline and templates, but **everything needed is also embedded in this prompt**, so you can create missing starter files if they are not present.

## Student details and deliverable
- Student: Boranov Daniyar; ID: 24B031718
- Course: AI-Driven Software Engineering
- Lesson: #08 — Practice Work #08; class: Thursday, 14:00–17:00
- Email destination: b.azimkhanov@kbtu.kz (DO NOT SEND)
- Email subject **exactly as the submission slide says**, despite the lesson-number discrepancy: `AI-Driven Software Engineering Practice #09, Boranov Daniyar, 24B031718`
- AI tool/model/version: use only actually verifiable names and versions; otherwise editable placeholder.
- Published demo URL: **`[INSERT CORRECT PUBLISHED DEMO URL]`** in report and email. Do not guess or substitute an old demo. No unnecessary GitHub link in the Word report.
- Produce a **genuine editable** `Practice08_Boranov_Daniyar_Report.docx` (NOT a PDF) plus the technical submission package.

## Principles and order
Follow: **REPRODUCE → LOCALIZE → EXPLAIN → PATCH → VERIFY → IMPROVE**.

Inspect repo and tests first, preserve current code and uncommitted changes, avoid destructive operations, and make a clean baseline reference. Preserve app functionality and responsive UI. Do not silently replace the project, assume test success, fabricate data or screenshots, or invent Skill installation and AI answers. Use exact real logs/paths; explain limits. Finish all tasks possible locally; prepare explicit manual follow-ups for ChatGPT/Claude actions and live URL. Avoid unnecessary dependencies and new functionality. Do not email or publish without my explicit instruction. Do not stop after planning.

### Acceptance criteria — all six must be verified
- **AC1:** reject start >= end and requests in the past.
- **AC2:** enforce maximum duration of 120 minutes.
- **AC3:** reject a blocked room.
- **AC4:** reject overlaps but allow time intervals touching at endpoints.
- **AC5:** return Available/Unavailable without modifying original booking data.
- **AC6:** preserve clear responsive desktop/mobile UI feedback.

Project assumptions from slides: one room, fictional bookings, deterministic fixed time, Boolean availability decision, no login or database.

## Phase A. Preserve baseline & test results (Task #01)
1. Inspect scripts, stack, booking logic, tests, Git state, previous #07 coverage, and environment. Keep existing uncommitted changes safe.
2. Save a clean baseline snapshot or commit if safe; record SHA/reference. If the current tree has changes, do not overwrite/reset them.
3. Run existing Practice #07 tests **before any experimental bug change**. Save real terminal output, relevant screenshot if possible, test counts and status.
4. Create `practice08/evidence/{baseline,bug-a,bug-b,skill,comparison,regression,ui}`, `practice08/reports`, `practice08/prompts` (or equivalent nonintrusive locations).
5. Maintain a table `Test ID | Input | Expected | Actual | Suspected Cause`, later adding confirmed root cause and evidence.
6. Do not assume a bug already exists: verify actual baseline behavior.

## Phase B. Two controlled defective cases, separately (slide 12)
**BUG-A:** overlap logic incorrectly considers endpoint-only touching a conflict. Example: existing booking 10:00–11:00 and request 11:00–12:00 should be Available, assuming fixed current time earlier and room unblocked. Real overlaps remain Unavailable.

**BUG-B:** availability function modifies the original booking array. It must not mutate, reorder, append or remove entries. Assert unchanged original bookings in test.

For EACH bug independently:
- Use instructor-provided buggy code if available; otherwise introduce exactly one deliberate defect in an isolated temporary branch/worktree/copy based on the saved clean baseline.
- Record actual test name, exact input, independently checked expected outcome, actual failing terminal output BEFORE any fix, relevant before-fix code diff, suspected cause and confirmed cause.
- Produce a minimal deterministic failing test; demonstrate RED then diagnose then PATCH then GREEN.
- Restore/isolate between defects; never contaminate the original project or combine both injected bugs.
- Explain code locations and smallest proposed patch **before implementing it**. Preserve evidence of the pre-fix diagnostic state.
- Make necessary minimal reviewed fixes in the relevant environment, then rerun the targeted test and full suite. If baseline was already correct, demonstrate repair in the controlled branch and do not degrade the original app just to make changes.

## Phase C. Create the required Agent Skill (Tasks #02 and #03)
The required **literal** file contents are below. Create `bug-detector/SKILL.md` exactly, without altering the teacher-specified wording:

```markdown
---
name: bug-detector
description: Diagnose bugs in existing code using acceptance criteria and failing tests. Use when reviewing the Smart Campus booking application.
---

# Bug Detector

## Procedure

1. Read acceptance criteria, code, and observed failure.
2. Reproduce with the smallest deterministic input.
3. Identify the likely root cause and relevant lines.
4. Separate confirmed defects from hypotheses.
5. Suggest a minimal fix, but do not edit code yet.
6. Propose a regression test and expected result.
7. Output: defect | evidence | root cause | fix | test.
```

Also create the following optional officially supported UI metadata file **to satisfy the extra ZIP inspection item on slide 20** at `bug-detector/agents/openai.yaml`:

```yaml
interface:
  display_name: "Bug Detector"
  short_description: "Diagnose booking failures from tests and acceptance criteria"
  default_prompt: "Use $bug-detector to diagnose this Smart Campus booking failure, explain the root cause and propose a minimal fix without editing code."

policy:
  allow_implicit_invocation: false
```

Use **exact UTF-8 plain text** and three-hyphen YAML delimiters, correct lowercase name, no API keys, no private data. Validate files by reading them. ZIP **containing top-level `bug-detector/SKILL.md` and `bug-detector/agents/openai.yaml`** as `bug-detector.zip`, inspect `zipfile.namelist()` or `unzip -l` and preserve a genuine screenshot when UI capture is available.

**Important academic requirement:** Slide 14 explicitly tells the student to *create SKILL.md by hand*. This prepared content is a template, not evidence of handwriting/manual creation. The student must personally recreate or retype the final file in their own editor before submission. Tell the student this plainly; do NOT claim it was manually authored by a student if you generated it.

A copy can be installed locally to `.agents/skills/bug-detector/` for Codex if beneficial, but preserve the separate assignment deliverable `bug-detector/` and ZIP. The no-Skill comparison session must be demonstrably unskilled. Explicit skill invocation can use `$bug-detector`; local Codex Skill usage is not automatically evidence of installation in ChatGPT or Claude.

## Phase D. Installation / activation (slides 18–20, 27)
- Prepare screenshots/instructions for ChatGPT Skills library (/skills) or Claude Skills settings when supported; ZIP upload and activation must be genuine.
- For actual ChatGPT/Claude skill installation, request student participation if agent lacks account/UI access. Never claim it happened if it did not.
- If unsupported, teacher explicitly allows **prompt-only simulation**: paste the SKILL.md instructions as a prompt, **label clearly as simulation, NOT an installed skill**.
- Capture/preserve true ZIP structure screenshot and real activation screenshot; otherwise leave `[INSERT REAL SCREENSHOT: ...]` editable placeholders.

## Phase E. Actual comparison WITHOUT vs WITH Skill (Tasks #04 / #05)
Create a frozen real input file `practice08/prompts/COMPARE_SHARED_INPUT.md` based on one actual failed test (prefer BUG-A), with exact:
- AC1–AC6;
- relevant real code excerpts with filenames;
- failing test code;
- verbatim real terminal output;
- deterministic clock/bookings/request;
- diagnostic question verbatim:
  **`Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.`**

Use this **identical** frozen input in TWO independent fresh chats with same model/settings if possible:

A. No Skill: do not install/attach/invoke its instructions. Save the AI response verbatim, actual model/version, screenshots, and evidence of Skill being off. Never auto-activate.

B. With Skill: explicitly activate `bug-detector` (or teacher-permitted prompt-only simulation) before providing the same frozen input and identical question. Save complete AI response verbatim, exact model/version if available, evidence of activation or stated simulation.

**NO fabricated model output.** If distinct real ChatGPT/Claude sessions are unavailable, prepare complete ready-to-copy materials and mark comparison *PENDING STUDENT MANUAL STEP*. Do not claim an unbiased comparison was performed without actual independent sessions.

Fill this instructor-required comparison table **only with real evidence**:

| Criterion | No Skill | With Skill |
|---|---|---|
| Correct root cause | pending | pending |
| Reproducible test | pending | pending |
| Minimal proposed patch | pending | pending |
| Unsupported claims | pending | pending |
| Clarity of explanation | pending | pending |

Judge against actual code/tests; the skill need not perform better. Preserve unchanged prompts and exact responses; avoid hiding model limitations.

## Phase F. Final repair and regression (Task #06)
- Review minimal patch before implementation, apply one focused change at a time; preserve actual diff.
- Rerun previously failing test(s), then the **entire** test suite (for Vitest `npx vitest run`, if the project uses it).
- Verify booking fixtures remain unchanged and endpoint-touching succeeds, genuine overlap fails.
- Check AC1–AC6, responsive UI, build/typecheck/lint where scripts exist. Use actual outputs, not claims.
- Record observed fail/pass counts, commands, exact logs, screenshot evidence. If browser automation isn't accessible, say so and leave placeholders; do not fabricate.
- One real AI-assisted debugging limitation must be described.

## Phase G. Produce Word report, NOT PDF
Create an **editable real** file `Practice08_Boranov_Daniyar_Report.docx` with clean, professional B1–B2 English: Arial 11–12, black text, white background, restrained headings and tables, no artificial page limit, screenshot placements near explanations.

Required sections:
1. Cover — student name/ID, Lesson #08 Practice Work #08, class Thursday 14:00–17:00, verifiable AI tool/version/model, placeholder `[INSERT CORRECT PUBLISHED DEMO URL]`.
2. Objective/project overview, Practices #06/#07, exact AC1–AC6.
3. Baseline snapshot and real original test output.
4. BUG-A/BUG-B controlled failing tests and defect log, expected/actual, root causes.
5. `bug-detector`: exact SKILL.md, validation, ZIP tree screenshot, installation screenshot OR explicit simulation/fallback.
6. AI analysis WITHOUT Skill: exact prompt and genuine unedited AI response (or conspicuous pending placeholder).
7. AI analysis WITH Skill: same input, activation evidence, genuine unedited AI response (or pending placeholder).
8. Five-criterion comparison with evidence; if no real sessions, mark pending, never fabricate.
9. Minimal code repair & actual before/after diff.
10. Regression: actual targeted/full test outputs, AC1–AC6, mutation/endpoint check, UI desktop/mobile real screenshots or unverified placeholders.
11. Real limitation of AI debugging.
12. **3–5 sentence** evidence-based conclusion: did skill help? what tests proved? If comparison pending, do not assert the skill helped.

In Word leave the published URL **editable placeholder** for me to fill. Use the correct delivered source project with tests; omit node_modules, .git, secrets, caches. If any screenshot/response is missing, insert literal placeholder like `[INSERT REAL SCREENSHOT: Skill activation]` and list in pending checklist. No invented screenshot, no fabricated pass state. No unnecessary AI-authorship meta phrases, but **do include required AI tool/model information, skill usage, actual prompts, truthful experiment limits**.

## Phase H. Package and email draft
Prepare:
```
Practice08_Boranov_Daniyar_Submission/
  Practice08_Boranov_Daniyar_Report.docx
  SKILL.md
  bug-detector.zip
  SmartCampus_Source_Export.zip
  evidence/                 # real terminal logs, diffs, genuine images
  prompts/                  # frozen input and both trial prompts
  comparison.md             # with real results or honestly pending
  defect_log.md
  README.md
  PENDING_MANUAL_STEPS.md
  Email_Draft.txt
```
Organize without inventing data or duplicating gigantic dependency folders. ZIP the full submission if useful, but keep .docx separately editable. Draft email to `b.azimkhanov@kbtu.kz` with subject `AI-Driven Software Engineering Practice #09, Boranov Daniyar, 24B031718` and class time, actual tool/model, attachments and `[INSERT CORRECT PUBLISHED DEMO URL]`; **do not send**. Adjust email wording if some materials are still missing.

Per instructor's checklist, ensure: saved baseline + first failing output, manually created valid SKILL.md (student action still required if generated here), ZIP and attempted install, fair same-defect comparison, root cause and minimal repair, real regression tests, at least one AI limitation, correct project link/export, genuine screenshots and 3–5 concluding sentences.

**Optional, not necessary:** second `regression-tester` Skill and MCP server.

## Final execution mandate
Actually inspect the open repo; execute every available task, create real output files, use template starter material if present, and keep the project functional. Do not stop at a plan. If something needs a student's external ChatGPT/Claude interaction, leave a precise 1–2–3 instruction and a clearly marked placeholder while finishing the rest. Provide final exact artifact paths, test counts, actions completed, remaining student steps, and any uncertainties. Do not wait for unnecessary confirmation or provide unsupported success claims.
