# Explain Smart Campus room availability

**Base** `main`
**Head** `practice11/explain-availability`

Add an optional explanation below the booking decision. The existing checker determines availability and the mock receives five fields derived from that result. A failed, timed-out, unavailable or invalid response uses a labeled deterministic fallback.

Two confirmed review findings were repaired. Enter keeps focus on the explanation button during and after a request. The existing request guard allows one adapter start while pending. The response validator requires exactly the single own field `explanation`.

## Local verification

- Vitest 105/105, including all 81 existing tests and 24 new tests.
- Legacy tests 9/9. The original Vitest suite also passed 17/17 when run separately.
- Chrome checks passed for the original smoke script, Practice 07 12/12, Practice 08 14/14, Practice 09 18/18 and Practice 11 8/8.
- Typecheck, lint and production build passed. Booking rules, fixtures, earlier tests, dependencies and the existing CI workflow match the base commit.

See [verification evidence](practice11/Verification.md), [review findings](practice11/Review_Findings.md) and the [changed files](practice11/Changed_Files.md).

The feature test records runtime errors on its main page. Separate failure and race pages verified their UI assertions. This PR is prepared for human review. Bolt preview and the public demo are separate release steps.
