# Practice #08 — Defect Log

| Test ID | Defect | Input (fixed clock, bookings, request) | Expected | Actual (real output) | Suspected cause | Confirmed root cause and code location | Evidence file | Regression status |
|---|---|---|---|---|---|---|---|---|
| [real test ID] | BUG-A: endpoints incorrectly considered overlapping | [actual] | Available | [actual failure] | [hypothesis] | [after investigation] | [path] | [real status] |
| [real test ID] | BUG-B: original bookings mutated | [actual] | No changes to original array | [actual mutation] | [hypothesis] | [after investigation] | [path] | [real status] |

Rules: keep observed failure output verbatim; no invented dates/IDs/outputs; distinguish hypotheses from confirmed explanations. One deliberately injected defect at a time, in isolation. Preserve true before-fix tests and code diffs.
