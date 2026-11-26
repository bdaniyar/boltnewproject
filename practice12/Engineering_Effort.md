# Engineering effort

Times refer to 26 November 2026 in Asia/Almaty (UTC+05:00). The [timing CSV](Engineering_Effort.csv) records the phase windows. Command metadata records exact timestamps, durations and exit codes. Some work overlapped. These timings measure the current exercise and include browser interactions.

| Phase | Code-based | Appsmith |
|---|---|---|
| Environment setup | Lockfile install 7.08 s (0.12 min) using existing Node and Chrome. | 314 s (5.23 min) for Docker pull, startup, onboarding and app creation. |
| Implementation | 78 s (1.30 min), including contract preparation and React adaptation. | 305 s (5.08 min) for visual assembly, the rule object and bindings. |
| Repair | No application code repair after the first run. | 268 s (4.47 min) to investigate and fix table lint and layout, plus a 1.4 s mobile column refinement. |
| Build and repair | 1.30 min. | 9.57 min. |
| Final tests | 3.80 s for the common cases, safe input probes and narrow check. | 7.20 s for the identical run. Re-import replay took 9.38 s. |

The first Appsmith prototype had returned Available by 11:40:37. The final canvas stacks the form, decision and table, and the result and booking text fit at 375 px. The replay harness was corrected to wait for Appsmith Preview after reload and to measure readable text on phone-sized screens.

The baseline and final code suites each passed 105 Vitest tests and 9 legacy tests. The separate original run passed 17 tests already included in 105. The existing booking and Explain Availability browser suites passed 18/18 and 8/8 both times. Practices 06–08 ran on both versions. Practice 06 reported aggregate assertion success, Practice 07 passed 12/12 and Practice 08 passed 14/14. See [baseline](evidence/baseline/) and [final evidence](evidence/code/).
