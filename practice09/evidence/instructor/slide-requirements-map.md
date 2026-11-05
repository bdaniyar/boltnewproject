# Instructor slide review and requirements map

Source: `/Users/daniarboranov/Downloads/Lesson 09 - Software Engineering - Practice 5.pdf`. All 34 pages were extracted and individually visually inspected after bundled Poppler rendering at 95 DPI. Rendered pages and complete extraction are under `practice09/qa/slides/`. Source digest is in `source-manifest.json`.

| Slide | Topic | Classification | Requirement or verified visual content |
|---|---|---|---|
| 1 | Lesson title | Context | Software Engineering Lesson 09 Practice. No action. |
| 2 | Welcome | Context | Welcome image and Lesson 09 footer. No action. |
| 3 | Agenda | Context | Useful patterns, Practice work 09 and Q and A. |
| 4 | Agenda section highlight | Context | Highlights useful patterns. No action. |
| 5 | Useful patterns agenda | Context | Refactor with Bolt.new, repository instructions and verification. |
| 6 | Learning outcomes | Required | Diagnose a concrete maintainability problem before selecting at most one or two useful patterns; customize Bolt through explicit repository instructions; prove unchanged behavior with tests and UI checks. |
| 7 | Connection to Lecture 09 | Context | Repository instructions communicate context, build commands, rules and boundaries. Mentions AGENTS.md, CLAUDE.md, hooks, skills and subagents. |
| 8 | Agent features and Bolt | Constraint | Bolt.new is the implementation environment. Do not assume every agent feature is supported. Skills are reusable procedures; hooks are tool-specific deterministic automation. |
| 9 | Why Bolt | Required | Continue the earlier working Smart Campus app. Use Bolt AI chat to inspect files, propose changes and implement small refactors. |
| 10 | Preview and export | Required | Preview app, inspect generated code, run available tests; export/download if needed for local verification and evidence. |
| 11 | Scope | Constraint | Start from repaired Practice08 app. One-room scenario, fictional bookings, fixed clock and availability decision only. No login, backend, database or saved booking creation. |
| 12 | Acceptance criteria | Required | Preserve AC1 reject start >= end and past requests; AC2 reject duration >120; AC3 reject blocked room; AC4 reject overlap but allow endpoint touching; AC5 non-mutation; AC6 clear desktop/mobile feedback. |
| 13 | Strategy diagram | Conditional | Strategy only if multiple real interchangeable policies. Transport illustrations add no assignment requirement. |
| 14 | Adapter diagrams | Conditional | Adapter only to normalize two inconsistent input booking shapes. Generic Adapter and XML-to-JSON diagrams add no assignment requirement. |
| 15 | Module boundary | Required guidance | Prefer small module boundary separating pure booking rules from UI and fixtures. Avoid Singleton, Factory and unnecessary class hierarchies without concrete need. |
| 16 | Agenda section highlight | Context | Highlights Practice work 09. No action. |
| 17 | Step01 inspect without editing | Required | Ask Bolt to inspect before editing; identify booking function, UI, fixtures, tests; list at most three maintainability problems with file references; recommend zero, one or two patterns only if justified; preserve AC1-AC6/UI. |
| 18 | Step02 select small refactor | Required | Choose one genuine problem; preferred solution extracts pure availability function into own module; optional second Adapter only for genuinely inconsistent formats. Write two-sentence rationale: problem -> pattern -> expected benefit. |
| 19 | Root AGENTS.md | Required | Create root AGENTS.md in Bolt editor/file tree; document purpose, structure, accepted rules, commands and forbidden scope changes. Explicitly ask Bolt to read/summarize/follow. Do not assume automatic loading. |
| 20 | Bolt projects screenshot | Illustration | Image-only screenshot of https://bolt.new/projects: logged-in account Jomart, Free; All projects; No projects found; Create your first project to get started; Create project button. Contains no code or further requirements. |
| 21 | Sample AGENTS.md | Required guidance | Sample includes Project, Constraints, Engineering rules and Verification. Preserve AC1-AC6, no backend/login/creation, pure functions/minimal changes, at most two justified patterns, no fixture mutation, responsive feedback, existing/focused tests, changed files/rationale/evidence. |
| 22 | Step04 explicit instruction activation | Required | Ask Bolt to read root AGENTS.md, summarize constraints and exact test commands, do not edit yet. If unreadable, paste contents. Do not claim automatic loading. |
| 23 | Optional Adapter experiment | Conditional | If start/end and startTime/endTime shapes both exist, normalize at boundary, test each shape and explicitly reject malformed input. If one consistent format, skip Adapter and explain. |
| 24 | Optional Strategy experiment | Conditional | Only for two genuinely required policies; hypothetical alternative may be separate test only. Preserve live contract. One policy should remain a simple function. |
| 25 | Step06 regression tests | Required | Create/update tests for past time, reversed interval, 121-minute duration, blocked room, overlap, endpoint touching and unchanged fixtures. Explain expected outcomes via AC1-AC6. Do not weaken/delete assertions. |
| 26 | Step07 run verify | Required | Use Bolt preview/test/terminal if available, otherwise export and test locally. Record exact command/output/pass/fail counts. Desktop/narrow UI, before/after comparison, fix regressions. |
| 27 | Without versus with instructions | Required | A ask Bolt recommendation without referencing AGENTS.md. B separate conversation/checkpoint explicitly supplies AGENTS.md constraints. Compare scope control, unnecessary patterns, test quality and clarity. Differences do not prove automatic AGENTS.md support. |
| 28 | Advanced features and Bolt | Constraint and optional | Explicitly share AGENTS.md as project documentation. Optional reusable checklist may be pasted. Native SKILL.md execution must not be assumed. |
| 29 | Hooks subagents MCP | Optional | Use manual tests/supported project scripts, do not assume lifecycle hooks. Subagents/MCP discussion or research optional and not required. |
| 30 | Reusable review checklist | Optional | Read constraints/AC1-AC6; identify smallest problem; justify patterns or none; preserve UI/fixtures; run/report tests; explain edited files and limitation. |
| 31 | Submission contents | Required | Revised source export/share and working preview link if available; AGENTS.md; changed-file list; 100-150-word pattern rationale; commands/results; TWO UI screenshots; before/after evidence; two prompts; actual Bolt responses; short reflection on recommendations. |
| 32 | Professional reflection | Reflection guidance | Answer whether complexity fell, unsolicited Bolt changes, explicit AGENTS.md effect, and evidence of preserved behavior. Use observed evidence. |
| 33 | Email submission | Required | Recipient b.azimkhanov@kbtu.kz; subject AI-Driven Software Engineering Practice #10, full name, ID (despite Lesson09/Practice09). Include class day/time, AI tool/version/model, published live demo link and export, AGENTS.md, screenshots. The slide asks student to send at end of class; do not send automatically. |
| 34 | Q and A | Context | Closing slide. No extra requirements. |

## Requirements easy to miss

- Bolt.new is explicitly the implementation environment; local Codex work cannot be described as actual Bolt responses or Bolt implementation. Record any access limitation and genuine pending steps.
- Both a TWO-SENTENCE design rationale (slide18) and a 100-150-WORD pattern rationale (slide31) are requested; provide both or make the relationship explicit.
- Initial inspection may recommend ZERO patterns. Do not force Adapter/Strategy where fixtures and policy are consistent.
- Root AGENTS.md requires explicit Bolt read/summarize invocation; no automatic-loading claims.
- Comparison requires a separate conversation/checkpoint for condition B and four concrete criteria.
- Slide31 requests TWO UI screenshots and before/after evidence; source export, exact test counts and real Bolt responses are separate requirements.
- Email subject says Practice #10 while the assignment is Practice #09. For this student: `AI-Driven Software Engineering Practice #10, Boranov Daniyar, 24B031718`.
- Slide33 asks for a live published project link; slide31 says preview link if available. Leave an honest placeholder when unavailable and do not invent a URL.
- Slide20 is an empty-project-list illustration, not AGENTS.md instructions or evidence of the student account.
- There is no slide titled Step05; numbering jumps from Step04 to optional experiments and Step06. Do not invent missing slide requirements.

## Runtime verified

Managed runtime manifest now reports bundle 26.1030.10813 and artifact-tool 2.8.119. Expected managed Python is `/Users/daniarboranov/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`; Node is under `dependencies/node/bin/node`; bundled Poppler under `dependencies/bin/override/`; bundled LibreOffice is `dependencies/bin/override/soffice`. Never use the desktop LibreOffice. No artifact-start marker was run during this read-only PDF review.
