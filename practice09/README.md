# Software Engineering Practice Work 09

Student: Boranov Daniyar, 24B031718. Thursday, 14:00–17:00.

The editable report is Practice09_Boranov_Daniyar_Report.docx. SmartCampus_Source_Export.zip contains the tested application and all previous/new test source. Root AGENTS.md is also supplied separately. No email was sent. The requested email subject uses Practice #10, while this assignment is Practice Work #09; Email_Draft.txt preserves that distinction.

## Completed local work

The complete 34-slide instructor PDF was read. Inspection, Git identity, source structure and baseline results preceded the application patch. Three real findings were recorded; one was selected. BookingPanel now reuses its validation result for status instead of validating again. ZERO new design patterns were justified. The pure booking module, fixtures, existing JSX and all previous tests remain unchanged.

Baseline:66/66 Vitest,9/9 legacy,18/18 browser. The15 new component tests also passed against the exact baseline in isolation. After refactoring:81/81 Vitest,9/9 legacy,18/18 browser; typecheck, lint and build passed. All25 before/after behaviour comparisons match. Fresh extraction with npm ci also passed81/81 tests. The subset runs are not extra unique tests.

## Evidence locations

- evidence/baseline: compact frozen original source, Git reference, source hashes and real original test outputs.
- evidence/inspection: pre-change findings and source structure.
- evidence/implementation: exact before/after component, patches, preservation hashes and reviews.
- evidence/regression: real outputs and metadata including fresh-export installation/test results.
- evidence/ui-before and evidence/ui-after: real desktop/mobile screenshots, commands and full recorded observations.
- evidence/ui-comparison.json and .txt:25 behaviour comparisons,14 feedback states and screenshot hashes. Three of eight PNG pairs are byte-identical; five differ outside the panel. See ui-screenshot-review.txt.
- evidence/instructor: PDF digest and requirements map for all34slides. Full slide renders remain local QA, not submitted evidence.
- prompts: exact A, explicit B/AGENTS, read/summarize and implementation prompts.

## Reproduce the tested source

Extract SmartCampus_Source_Export.zip into a clean directory, then run:

```sh
npm ci
npm run test:original
npx vitest run tests/practice08.regression.test.ts
npx vitest run tests/practice09.refactoring.test.tsx
npx vitest run
npm run test:legacy
npm run typecheck
npm run lint
npm run build
```

The measured environment was Node22.22.0/npm10.9.4. Installed Google Chrome and Playwright are used for browser checks. Start `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort` in another terminal; run `node tests/practice09-browser.mjs after`. Evidence is created under practice09/evidence and never overwritten. To compare the supplied saved captures, run `node practice09/tools/compare-ui.mjs` in a tree containing those captures, or inspect the included comparison JSON.

## Unavailable external evidence

No valid Practice09 Bolt conversation A/B, response, model detail or implementation demonstration was obtained. The accessible old Bolt tab was not verified as the current baseline, and controls did not establish an independent project. Its genuine screenshot is access evidence only. Comparison criteria are marked Not observed, not filled with invented answers. UNAVAILABLE_EVIDENCE.md supplies exact remaining steps using the same frozen source and explicit guided instructions. The revised publication URL stays editable: [INSERT VERIFIED PUBLISHED BOLT DEMO URL].

AI tool used locally: OpenAI Codex, GPT-6 model family. Exact model build and app version were not exposed. No claim is made about automatic AGENTS.md loading, native Skill activation in Bolt or an unperformed experiment.

Dependencies, caches, build output, Git internals, secrets, historical assignment packages, QA renders and the full historical repository archive are excluded from this submission. The full tracked baseline remains locally preserved as practice09/evidence/baseline/SmartCampus_Practice08_Baseline.zip. SHA256SUMS.txt verifies the submitted files.
