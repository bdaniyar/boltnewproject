# Local verification and evidence

The base commit is `ab36a3a97aba212d072a102f5d8ae10e745ca5b0`. The [checkpoint](evidence/baseline/checkpoint.json) identifies the baseline source. The [candidate patch](evidence/implementation/implementation.patch), [repair manifest](evidence/repairs/applied.json) and [final source patch](evidence/final/source.patch) identify the exact tested changes. Both proposal hashes matched the preserved review manifest. The isolated preflight tested both patches before they were applied in the linked worktree. The final code matched the preflight copy across all nine implementation paths.

| Check | Baseline | Before repairs | Final |
| --- | --- | --- | --- |
| `npm test` | 81/81 | 104/104 | 105/105, including the same 81 booking tests and 24 feature tests |
| `npm run test:original` | 17/17 | Part of full suite | 17/17 separately |
| `npm test -- tests/practice11.explanation.test.ts` | Feature absent | 23 in full suite | 24/24 separately |
| `npm run test:legacy` | 9/9 | 9/9 | 9/9 |
| `node tests/practice09-browser.mjs after` | 18/18 using the baseline phase | 18/18 | 18/18 |
| `node tests/practice11-browser.mjs` | Feature absent | 7/7 | 8/8 |
| `npm run test:browser:practice08` | See prior practice evidence | See prior practice evidence | 14/14 |
| `node tests/practice07-browser.mjs` | See prior practice evidence | See prior practice evidence | 12/12 |
| `npm run test:browser` | See prior practice evidence | See prior practice evidence | All script assertions passed. The runner has no case counter. |
| `npm run typecheck`, `npm run lint`, `npm run build` | Passed | Passed | Passed |

[Baseline logs](evidence/baseline/), [candidate logs](evidence/implementation/), [preflight logs](evidence/repairs/preflight/) and [final logs](evidence/final/) include command lines, output and exit status. The historical browser scripts were run unmodified from the isolated copy against the final worktree server. Their output stayed outside historical evidence directories. The production build reported its existing outdated Browserslist data warning and succeeded. The lockfile was preserved.

## Acceptance and regression results

| Criterion | Evidence |
| --- | --- |
| AC1 · Invalid and past intervals | The Chrome booking run passed malformed, reversed, zero-length and past checks. Feature cases E04, E05 and B04 passed. |
| AC2 · Maximum duration | Chrome passed the 120-minute boundary and rejected 121 minutes. Feature cases E06 and E07 passed. |
| AC3 · Blocked rooms | Chrome passed blocked and malformed/blocked precedence checks. B03 showed the confirmed blocked status and a separate explanation. |
| AC4 · True overlap and touching endpoints | Chrome passed both boundary cases. B01 showed a conflict and B02 allowed 11:00–12:00 after a booking ending at 11:00. |
| AC5 · Data preservation | E21 verified frozen fixture values and references across repeated calls. Chrome compared all five timeline entries and browser storage. |
| AC6 · Responsive feedback | Chrome passed desktop and 375 px mobile checks without page overflow. B05 showed the confirmed status and separate explanation at 375 px. |
| Feature failure and output rules | E14–E20 and E24 passed timeout, unavailable adapter, failure and invalid-response checks. B06 showed a real UI fallback with an injected adapter failure. B07 and B08 checked stale completion and keyboard behavior. |

The [test-case table](Test_Cases_Final.csv) contains exact observations for 24 Vitest cases and eight browser scenarios. [Before probes](evidence/repairs/before/review-probe.txt), [after browser results](evidence/final/ui-feature/results.json) and [targeted output](evidence/final/targeted.txt) establish the two repairs. The report uses genuine [final screenshots](evidence/final/ui-feature/).

Four local click-to-assertion samples ranged from 210 to 239 ms, with a median of 219.5 ms. Each normal mock request includes a configured 100 ms delay. The timeout test used a simulated clock to verify 1,500 ms. The feature issued zero external model calls. No real model benchmark or token cost was measured.

## Residual issues for integration

R11-03 is a low-severity coverage gap in the feature browser runner. Hosted CI and the merged Bolt preview still require verification. The existing Practice 10 dependency assessment remains applicable because dependencies are unchanged. No new external service, credentials or booking-write path was introduced.
