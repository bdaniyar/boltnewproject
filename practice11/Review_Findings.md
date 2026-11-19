# Verified review findings and repairs

A separate read-only Codex reviewer examined the exact candidate diff, repository instructions, feature contract, booking source and tests. It considered correctness, safety, maintainability and performance. The original [request](evidence/review/review-request.txt), [response](evidence/review/agent-review-response.md) and [independent probe](evidence/repairs/before/review-probe.txt) are preserved. Codex was the recorded tool. An exact model identifier was unavailable.

| Finding | Severity and classification | Verification and disposition |
| --- | --- | --- |
| R11-01 · Keyboard focus | Medium · Confirmed and repaired | Chrome showed `BUTTON` before Enter and `BODY` after the result. The browser drops focus when the focused native button becomes disabled. The patch keeps the button focusable with `aria-disabled` and preserves the synchronous request guard. B08 verified focus while busy and after completion, one adapter start for two Enter presses, and the original overlap status. |
| R11-02 · Output shape | Low · Confirmed and repaired | The service previously returned `mock` for a response with enumerable `extra` and hidden `explanation`. The validator counted enumerable keys but checked ownership of the explanation separately. The patch counts every own key and requires the only key to be `explanation`. E24 observed `fallback` for the same two-field object. |
| R11-03 · Browser evidence coverage | Low · Confirmed and open | Source inspection found three feature-test pages with a page-error listener on the first page only. Failure, stale-result and keyboard scenarios still passed their explicit assertions. The global error array cannot establish absence of runtime errors on the other two pages. This test-harness change was outside the two approved repairs. |
| R11-04 · Long input reset key | Low · Plausible and unverified | Code serializes raw times in the React reset key. The input gate rejects overlong values before calling the adapter. No user-visible slowdown was measured. |
| R11-05 · Stale reason after fixture replacement | Low · Unsupported in the current flow | The app holds fixed booking data with no replacement or write path. B07 observed the old result completing and verified that the latest explanation remained visible. A dynamic booking source would require a new check. |

The two repair patches are preserved in [proposals](proposals/). The final repository diff is in [source.patch](evidence/final/source.patch). All original test files and the booking rules and fixture files matched the base commit.

The local candidate is ready to demonstrate. Review of the existing dependency risk, hosted CI and Bolt synchronization belongs to the authorized integration step. The current implementation uses a local mock, so external model latency, cost and prompt performance remain unmeasured.
