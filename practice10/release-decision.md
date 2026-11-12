# Release decision

**CONDITIONAL — controlled fictional classroom use and human review.**

The approved changes pass the full 81-test Vitest suite, nine legacy tests, seven mitigation checks, typecheck, lint and production build. Historical browser scripts also pass: Practice07 12/12, Practice08 14/14 and Practice09 18/18; the earlier final browser script passes its assertions. All 25 recorded before/after comparisons match. Application source, fixtures, previous unit suites and built assets are unchanged.

R1 falls from 4 to 2 because the fresh evidence path and overwrite protection work, and the CI definition has been checked locally. R2 falls from 4 to 2 because the approved playbook now requires isolation, credential boundaries, evidence and human review. Human approval was obtained before applying the exact patches. Written rules still require enforcement.

Known dependency findings remain: npm reports 25 affected packages, including two critical and fourteen high. Production-only audit reports one high package in an unused Supabase dependency path. No dependency upgrade was authorized. The audit does not demonstrate a compromise or prove that the static live demo is affected; it does establish an owned security concern in installed tooling. R3 remains 4.

Boranov Daniyar owns these conditions: use fictional data and trusted project pages; avoid privileged Vitest UI/API servers, credentials and network-exposed development servers; plan a reviewed compatible dependency update; retain test-collection checks; review historical documentation; and obtain the first actual hosted CI run plus required-check enforcement before relying on CI for acceptance. Loopback alone does not resolve the cited Vite origin issue.

Readiness remains Level 2. The CI file is present and locally checked, but no hosted run or branch-policy enforcement was performed. No remote push, merge or deployment is part of this decision. The existing published URL was verified separately; its deployed revision is not established as the newly tested local source.
