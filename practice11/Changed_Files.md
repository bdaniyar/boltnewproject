# Practice 11 changed files

| Path | Purpose |
| --- | --- |
| `src/components/BookingPanel.tsx` | Displays the optional explanation below the existing status and passes the current validation outcome. |
| `src/components/AvailabilityExplanation.tsx` | Displays progress, input guidance and labeled results. Repair 01 keeps keyboard focus during a request. |
| `src/explanations/context.ts` | Validates incoming fields, maps the existing result to a reason code and supplies approved sentences. |
| `src/explanations/mockAdapter.ts` | Implements a delayed local mock and responds to cancellation. |
| `src/explanations/service.ts` | Enforces timeout, output validation and fallback. Repair 02 enforces the exact response key. |
| `tests/practice11.explanation.test.ts` | Adds 24 feature tests, including the extra-own-field regression. |
| `tests/practice11-browser.mjs` | Adds eight real browser scenarios, including the keyboard focus and duplicate activation regression. |
| `vitest.config.ts` | Collects Practice 11 tests with all earlier suites. |
| `README.md` | Documents the feature and its verification commands. |
| `practice11/` | Stores the contract, prompts, review, approved patches, test evidence, report and integration materials. |

The complete reviewed [candidate diff](evidence/implementation/implementation.patch) and [final staged source diff](evidence/final/source.patch) share baseline `ab36a3a97aba212d072a102f5d8ae10e745ca5b0`. The booking engine, fixtures, room catalogue, existing tests, dependencies and verification workflow match that baseline.
