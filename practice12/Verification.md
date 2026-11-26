# Practice 12 verification

| Run | Frozen Practice 11 baseline | Practice 12 code |
|---|---|---|
| Default Vitest | 105/105 | 105/105 |
| Original Vitest (included in default) | 17/17 | Covered by the 105 |
| Legacy Node | 9/9 | 9/9 |
| Practice 06 browser | All runner assertions passed | All runner assertions passed |
| Practice 07 browser | 12/12 | 12/12 |
| Practice 08 browser | 14/14 | 14/14 |
| Practice 09 booking browser | 18/18 | 18/18 |
| Practice 11 Explain Availability browser | 8/8 | 8/8 |
| Typecheck, lint, build | Passed | Passed |
| New shared browser cases | Outside baseline | 8/8 |
| New runtime validation probes | Outside baseline | 9/9 |

The original `bookingLogic.ts`, `sampleData.ts`, `BookingPanel.tsx`, `AvailabilityExplanation.tsx`, lockfile and prior test files have no diff against the frozen commit. The new route calls the duration adapter and the existing validator. [Baseline browser screenshot](evidence/baseline/ui-booking/01-desktop.png), [code patch](evidence/code/source.patch), [final browser evidence](evidence/code/acceptance/).

The original Appsmith Preview and the final JSON re-import each passed 8/8 common cases, 9/9 runtime validation probes, and the narrow-screen text and widget checks at 375 × 812. The re-import uses a separate workspace in the same Appsmith Community v2.7.2 instance. Tests measured the actual rendered input controls, result, booking row and browser exceptions. [Appsmith visual editor](evidence/low-code/01-visual-editor.png), [button binding](evidence/low-code/02-widget-configuration.png), [JavaScript object](evidence/low-code/03-rules.png), [original preview](evidence/low-code/acceptance/), [re-import results](evidence/low-code/reimport/ui-results.json), [export SHA-256](evidence/low-code/export.sha256).

The published Bolt URL returned HTTP 200 and displayed the earlier checker. Its Practice 12 query route did not display the new view. [Public demo verification](evidence/code/published/verified.json).
