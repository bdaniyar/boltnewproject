# Final agent-readiness audit

**Level 2 — Documented, with improved operating controls.** Level 2 remains appropriate: local checks and stronger instructions are verified, but hosted CI execution/enforcement, a formal formatter and dependency remediation are not established. Level 3 is not automatically awarded.

| Level | Check | State after mitigations | Evidence | Remaining control |
|---|---|---|---|---|
| Level 1 | Formatting | Partial | Consistent TypeScript/React conventions; no tracked formatter or EditorConfig. | Agree a formatting convention before wider team edits. |
| Level 1 | Lint / types | Satisfied | Fresh npm run lint and npm run typecheck exited 0. Typecheck covers src. | Retain these checks. |
| Level 1 | Unit and component tests | Satisfied | Fresh full run: 81 tests in four files passed. Original17, improved43, Practice08six, Practice09fifteen. | Confirm inclusion of new tests. |
| Level 1 | Build and dependency resolution | Satisfied with security gap | npm ci from tracked lockfile and npm run build passed. Declared ranges resolve exact versions via lockfile; existing advisories remain. | Review compatible dependency upgrades. |
| Level 2 | README and setup | Working setup; historical gaps remain | Approved Practice10 section documents fresh evidence output; older context remains R5. | Owner may review a later historical documentation cleanup. |
| Level 2 | Architecture and fixtures | Satisfied | Pure src/bookingLogic.ts, React components, types and five fictional fixtures clearly separated. | Keep A-102 exercise and existing UI. |
| Level 2 | AGENTS.md | Satisfied as documented rules | Exact approved section applied; secret, isolation, human review and merge boundaries included. | Continue enforcing the rules in each task; text is not a sandbox. |
| Level 2 | Environment example | Not applicable | Client-only fictional demo needs no application credentials or environment configuration. | Do not add a .env solely for rubric compliance. |
| Level 3 | CI and hooks | CI authored; hosted run unverified | Pinned Actions workflow with read-only permission; local YAML/shell/command checks passed. | First authorized remote run and owner-selected required checks; no push/deploy was performed. |
| Level 3 | Integration and evidence | Satisfied locally | Fresh output option and both evidence guards passed; 18/18 checks and 25/25 recorded comparisons matched. | Preserve independent run folders and actual logs. |
| Level 3 | Security verification | Partial | Actual npm audit, advisory/source checks and limited secret-pattern scan; known development dependencies affected. | Keep explicit owner and residual security controls. |
| Level 3 | Isolation and human approval | Documented and used in this task | Baseline isolated worktree; user approved both exact patches before application; no merge/deploy. | Use a disposable credential-free sandbox for untrusted execution. |
