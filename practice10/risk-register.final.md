# Final risk register

Likelihood and impact use the instructor scale 1–3; score = likelihood × impact. Initial and residual ratings are judgments supported by the stated evidence, not measured probabilities. Unsupported findings keep a hypothetical score and are not counted as confirmed defects. All owners: Boranov Daniyar.

| ID | Category | Status | Initial L × I | Initial score | Residual L × I | Residual score |
|---|---|---|---|---|---|---|
| R1 | Reliability | CONFIRMED | 2 × 2 | 4 | 1 × 2 | 2 |
| R2 | Agent operations | CONFIRMED | 2 × 2 | 4 | 1 × 2 | 2 |
| R3 | Security and privacy | CONFIRMED | 2 × 2 | 4 | 2 × 2 | 4 |
| R4 | Maintainability | CONFIRMED | 2 × 1 | 2 | 2 × 1 | 2 |
| R5 | Maintainability | CONFIRMED | 2 × 1 | 2 | 2 × 1 | 2 |
| R6 | Correctness | PLAUSIBLE / UNVERIFIED | 1 × 1 | 1 | 1 × 1 | 1 |
| R7 | Correctness | UNSUPPORTED | 1 × 2 | 2 | 1 × 2 | 2 |
| R8 | Security and privacy | UNSUPPORTED | 1 × 2 | 2 | 1 × 2 | 2 |

## R1

Cause / event / consequence: No repository CI; the documented browser command uses an occupied evidence directory. An agent skips browser checks or cannot attach a fresh review result. A UI regression may be proposed for acceptance without repeatable evidence.

Component: .github/workflows missing; tests/practice09-browser.mjs:14-16; README Verify/Practice09

Evidence: repository-safeguards.json shows no tracked CI; browser-original-command.txt exits 1 before launch; output-only adapter passes 18/18.

Initial score justification: Skipping manual checks is possible. The exact fresh-run barrier is reproduced. Impact is moderate because wrong feedback affects a fictional demo, without real bookings.

Mitigation and owner: Proposal 01: add limited-permission CI, a fresh output-directory option and the documented rerun command. Owner: Boranov Daniyar.

Verification: Apply only after approval; exercise new output path and overwrite guard, run all existing checks and inspect workflow. Cloud execution requires a later authorized push.

Residual assessment: New output path produced 18/18 browser checks; both overwrite guards passed; CI file/commands/shell structure verified locally. Likelihood falls to unlikely; impact is unchanged. First hosted CI execution and required-check enforcement remain unverified.

After evidence: evidence/after/mitigation-regressions.json; evidence/ui-comparison.json; evidence/verification/approval-and-application.json

## R2

Cause / event / consequence: AGENTS.md has no explicit worktree/port isolation, credential boundary or approval gate before merge and acceptance. An asynchronous agent shares state or treats passing tests as permission to accept changes. User work or the review boundary could be compromised.

Component: AGENTS.md Engineering rules and Verification commands

Evidence: AGENTS.before.md preserves the full original document; task 06 review maps each required boundary.

Initial score justification: The safeguards are absent, but no unauthorized action is observed. Moderate impact is appropriate for this small repository and preserved Git history.

Mitigation and owner: Proposal 02: add concise isolation, no-secret, evidence and explicit human-review rules. Owner: Boranov Daniyar.

Verification: Inspect exact AGENTS diff, confirm all AC rules and five-room scope remain, then record human approval and full regression results.

Residual assessment: Approved rules now require isolated tasks, no credentials, evidence and human review. The actual approval gate was used. Likelihood falls to unlikely; impact remains moderate. Written rules are not technical access enforcement.

After evidence: evidence/after/mitigation-regressions.json; evidence/ui-comparison.json; evidence/verification/approval-and-application.json

## R3

Cause / event / consequence: Locked dependencies include affected Vite 5.4.8, Vitest 2.1.9 and an unused Supabase path to ws 8.18.3. Vulnerable tooling is used with an untrusted origin or privileged test-server exposure; an unused dependency may later become active. Development source or privileged tooling may be accessed outside the intended origin.

Component: package-lock.json; vite.config.ts; development/test server modes

Evidence: npm-audit.json: 25 affected packages, two critical; production-only audit: one high package. installed-dependencies.json and ws-path.json confirm paths. vite-cors.json observes Access-Control-Allow-Origin: * on fictional source. Vendor advisories cited in security-assessment.md.

Initial score justification: Affected versions and permissive HTTP behavior are observed. No exploit is attempted; UI/API server conditions are not used by npm test. Supabase is not imported by app source. These checks do not establish a vulnerability in the static published bundle.

Mitigation and owner: Owner must plan a compatible toolchain/dependency update and rerun regressions. Until then use trusted dedicated project browser sessions, no privileged test API/UI, no credentials and no network-exposed dev server. Loopback alone does not fix the Vite advisory. Owner: Boranov Daniyar.

Verification: After a separately reviewed update: fresh npm ci/audit, inspect affected paths and server behavior, run full/browser/build checks.

Residual assessment: No dependency version changed. Full audit still reports 25 affected packages. Existing trusted-use/no-privileged-server controls have an owner; a reviewed compatible upgrade is outstanding. Score stays 4.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence

## R4

Cause / event / consequence: Vitest includes exactly four filenames. A contributor adds a new test without updating the include list. The test is silently absent from the default suite.

Component: vitest.config.ts:6-12

Evidence: test-discovery.txt: an existing temporary diagnostic test is excluded and exits 1 with No test files found; the file was then removed from the isolated worktree.

Initial score justification: The omission is reproduced. Current 81 tests still run; impact is minor for the present fixed suite and review can require explicit collection.

Mitigation and owner: Proposal 02 documents collection checks; later consider a reviewed glob while excluding controlled historical test copies. Owner: Boranov Daniyar.

Verification: Check runner collection for every new test; retain current 81-test coverage.

Residual assessment: The include allowlist is unchanged. The playbook now requires proof of test collection; the underlying omission risk remains scored 2.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence

## R5

Cause / event / consequence: README describes a sibling Practice07 artifact directory and old publication status that do not match the current checked-out context. An agent follows historical paths/status as current instructions. Review time is wasted or the wrong evidence is selected.

Component: README.md Assignment artifacts and final Practice09 paragraph

Evidence: documentation-inventory.json records absent sibling and the live URL check; original README is preserved in the Git baseline.

Initial score justification: The stale context exists. Core run commands work, and no behavior failure is observed, so impact stays minor.

Mitigation and owner: Keep audit/source references explicit; revise historical guidance in a separately reviewed documentation update. Owner: Boranov Daniyar.

Verification: Resolve links and compare stated evidence with the current tree.

Residual assessment: Historical README content remains outside the approved patch scope. Practice10 references and evidence are explicit, but no general documentation cleanup is claimed.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence

## R6

Cause / event / consequence: The helper checks the reference clock for finiteness but not its day range. A future direct caller supplies currentMinutes=-1. The helper accepts a request against a nonsensical reference clock.

Component: src/bookingLogic.ts validateBasicRange:7-30; CurrentTimeControl:27-42

Evidence: source-probes.txt records valid=true with -1. CurrentTimeControl clamps normal UI input; no external caller or failing user scenario was found.

Initial score justification: The helper edge is observed, but acceptance for out-of-domain callers is unspecified and the normal UI does not supply it. This is not established as an AC violation.

Mitigation and owner: Clarify the public helper clock domain before any behavior change. Owner: Boranov Daniyar.

Verification: Agree the reference-clock contract and add a regression only if required.

Residual assessment: No external caller contract was added. UI still supplies its clamped clock; this remains a plausible/unverified helper-domain concern.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence

## R7

Cause / event / consequence: Hypothesis: endpoint overlap or fixture mutation is wrong. Availability rejects a touching request or changes caller data. AC4 or AC5 would be violated.

Component: src/bookingLogic.ts hasOverlap/validateBooking; RoomCard copied sort

Evidence: 81/81 tests include both endpoints, real overlap and frozen data; 18/18 browser checks and source-probes.txt agree. Source filters by room and sorts a copy.

Initial score justification: Score is for the hypothetical consequence only. No present defect is found; it is not an actionable confirmed risk.

Mitigation and owner: Keep the existing regression assertions; no behavior patch justified. Owner: Boranov Daniyar.

Verification: Preserve AC4/AC5 coverage in each accepted change.

Residual assessment: Existing source/tests/browser evidence continue to contradict the proposed defect. Score describes hypothetical impact, not a confirmed bug.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence

## R8

Cause / event / consequence: Hypothesis: fixture display inserts raw HTML or tracked source exposes credentials. An input is interpreted as script or a credential is published. Unwanted code or data exposure.

Component: BookingPanel React text rendering; src/; tracked text/configuration

Evidence: source-probes.txt confirms synthetic script text is escaped; repository-safeguards.json has no raw HTML sinks and no matches in the limited 304-file credential-pattern scan.

Initial score justification: No supporting path or credential is found. The sample scan is not a full secret audit and does not certify all files/history.

Mitigation and owner: Keep fictional fixtures and no-secret boundaries; no invented XSS fix. Owner: Boranov Daniyar.

Verification: Review new HTML sinks/credentials and do not expose actual secret values.

Residual assessment: The escaped-render and bounded pattern scan are unchanged. Score describes a hypothetical scenario, not a demonstrated vulnerability.

After evidence: evidence/after/vitest.txt; security-assessment.md; initial challenge evidence
