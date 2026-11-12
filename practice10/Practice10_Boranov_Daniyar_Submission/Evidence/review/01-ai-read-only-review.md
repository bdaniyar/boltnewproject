# Original AI read-only risk review

Date: 12 November 2026. Tool: OpenAI Codex. Model exposed by the current session: gpt-6.1-sol. Exact model build and application version are not exposed. This is the actual review authored in this session before mitigation proposals. Source, tests, configuration and AGENTS.md have not been edited.

## Request

Act as a cautious software reviewer. Inspect this Smart Campus Room Availability Checker WITHOUT editing files. Identify risks in correctness, security, privacy, reliability, maintainability, and agent operations. For each risk, cite the exact file/function or missing check, explain the impact, suggest a way to verify it, and state uncertainty. Do not invent test results.

## Response

The app already has a pure booking-rule module and substantial boundary and fixture-preservation coverage. Fresh baseline execution reports 81 Vitest tests and nine legacy tests passing, with typecheck, lint and build successful. These observations reduce concern about the existing contract; they do not establish that all future edits will be safe. I propose checking the following risks before changing the project.

1. **Reliability — missing automated acceptance checks.** No tracked `.github/workflows/` configuration was found. `package.json` exposes useful checks, but contributors can omit them. A regression could reach a review without any machine-generated verification. Verify the tracked automation inventory and run the commands on the frozen baseline. Remote branch protection and other external CI settings have not been inspected; absence of repository CI does not prove an unsafe merge has happened.

2. **Agent operations — incomplete operating boundaries.** Root `AGENTS.md`, Engineering rules and Verification commands, protects fixtures and previous evidence and restricts publishing/email without authorization. It does not explicitly require a separate worktree/branch, unique ports, keeping credentials out of agent environments, or human approval before merge/acceptance. An asynchronous agent could share state or treat test success as authorization to accept changes. Check the exact document and workflow configuration. This is a missing safeguard, not evidence of an actual unauthorized action.

3. **Security/privacy — vulnerable development dependency versions.** `package-lock.json` resolves Vite 5.4.8 and Vitest 2.1.9. The fresh npm audit reports 25 affected packages, including critical entries. Inspect the actual advisory IDs, installed dependency paths, exposed server modes and built assets before assigning severity to this demo. The audit count does not establish exploitation or prove that the static published bundle includes those server vulnerabilities.

4. **Maintainability — new test files can be silently omitted.** `vitest.config.ts` explicitly lists four filenames. A future correctly named `*.test.ts` file outside that list would not join the default run. Verify with a temporary diagnostic test in the isolated baseline and inspect the collected list. Existing 81-test coverage is not absent; the concern is future test discovery.

5. **Reliability — current browser command is not reusable with preserved evidence.** `tests/practice09-browser.mjs` constructs a fixed `practice09/evidence/ui-before|after` output and throws when results already exist. README and AGENTS still recommend the after command, while after evidence is already committed. Verify the documented command on the checkpoint. This protects past evidence but can block a fresh review or CI job; no flakiness is claimed without an observed failure.

6. **Maintainability — stale documentation and generic instructions can confuse scope.** README's historical artifact and publication status should be checked against the current files. `.bolt/prompt` broadly requests fully featured production designs while AGENTS restricts this project to a fictional availability demo. Verify conflicts and precedence; do not remove the existing five-room UI just to satisfy the one-room exercise scenario. Incorrect extra features are a possible outcome, not a demonstrated defect.

7. **Correctness — overlap or mutation regression remains an investigation candidate.** `src/bookingLogic.ts` uses the half-open overlap predicate and filters by room; `RoomCard` sorts a copied array. Prior tests cover touching endpoints, actual overlap and frozen data. Run these tests again and exercise the real UI. I see no source evidence that the present implementation rejects touching endpoints or mutates caller bookings.

8. **Security/privacy — fixture text could be suspected of script injection.** `BookingPanel`, `RoomCard` and `Timeline` render fixture strings as React text/attributes; there is no observed raw HTML insertion path. Verify a synthetic markup string through the real components and scan source for HTML insertion and external writes. Treat an XSS claim as unsupported if the rendered text is escaped. Do not introduce real personal data or claim a complete secret audit.

The likely useful improvements are repeatable automated verification and explicit agent review boundaries. Choose final mitigations only after checking these proposals against source, commands and documentation. Any application correctness fix would require a reproducible failing case first.
