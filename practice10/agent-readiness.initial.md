# Agent readiness audit before mitigation

**Assigned level: 2 — Documented, with explicit gaps.** This is a rubric judgment, not a certification. The project has a lockfile, working build/tests, modular architecture and repository instructions. CI, repeatable browser evidence and complete operational boundaries are not yet established. Level 3 is not awarded.

| Level | Check | State | Evidence | Improvement |
|---|---|---|---|---|
| Level 1 | Formatting | Partial | Consistent TypeScript/React conventions; no tracked formatter or EditorConfig. | Agree a formatting convention before wider team edits. |
| Level 1 | Lint / types | Satisfied | Fresh npm run lint and npm run typecheck exited 0. Typecheck covers src. | Retain these checks. |
| Level 1 | Unit and component tests | Satisfied | Fresh full run: 81 tests in four files passed. Original17, improved43, Practice08six, Practice09fifteen. | Confirm inclusion of new tests. |
| Level 1 | Build and dependency resolution | Satisfied with security gap | npm ci from tracked lockfile and npm run build passed. Declared ranges resolve exact versions via lockfile; existing advisories remain. | Review compatible dependency upgrades. |
| Level 2 | README and setup | Partial | Documented setup works; browser rerun conflicts with saved evidence; historical paths/status stale. | Proposal 01 adds an accurate fresh-run command. |
| Level 2 | Architecture and fixtures | Satisfied | Pure src/bookingLogic.ts, React components, types and five fictional fixtures clearly separated. | Keep A-102 exercise and existing UI. |
| Level 2 | AGENTS.md | Partial | Architecture, AC1–AC6, commands and forbidden product features present. Secret/isolation/merge controls incomplete. | Proposal 02 adds missing operational rules. |
| Level 2 | Environment example | Not applicable | Client-only fictional demo needs no application credentials or environment configuration. | Do not add a .env solely for rubric compliance. |
| Level 3 | CI and hooks | Gap | No tracked .github workflow or hooks. No external enforcement inspected. | Proposal 01 adds CI; hooks are optional with documented CI/human review. |
| Level 3 | Integration and evidence | Partial | 18/18 real browser checks, genuine desktop/mobile screenshots and logs exist; a new output path was required. | Make fresh output reproducible via Proposal 01. |
| Level 3 | Security verification | Partial | Actual npm audit, advisory/source checks and limited secret-pattern scan; known development dependencies affected. | Keep explicit owner and residual security controls. |
| Level 3 | Isolation and human approval | Gap in instructions | This audit used an isolated worktree, but the original agent playbook does not require it. | Proposal 02 requires worktree/port/credential boundaries and review before merge. |
