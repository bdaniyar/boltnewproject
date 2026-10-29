# Frozen input — identical in BOTH independent AI chats

**Important:** Codex must populate this template using one real failing test, the actual code, real output, and AC1–AC6. Then freeze an unchanged copy and use the EXACT same content in both chats. Do not alter code or tests between trials.

## Acceptance criteria
- AC1: Reject start >= end and requests in the past.
- AC2: Maximum allowed duration is 120 minutes.
- AC3: Reject a blocked room.
- AC4: Reject real overlaps and allow endpoint-only touching.
- AC5: Return Available / Unavailable without mutating booking data.
- AC6: Maintain clear desktop/mobile UI feedback.

## Relevant code
[INSERT ACTUAL SOURCE FILE CONTENT OR RELEVANT EXACT EXCERPT WITH PATHS]

## Exact failing test
[INSERT ACTUAL TEST FILE CONTENT OR RELEVANT EXACT EXCERPT]

## Actual test failure / terminal output
[INSERT VERBATIM REAL TERMINAL OUTPUT]

## Deterministic environment / inputs
[INSERT FIXED CLOCK, BOOKINGS, REQUEST AND OTHER RELEVANT REAL DETAILS]

## Same diagnostic question for both chats
Find the root cause of the failed room-booking test. Propose a minimal patch and regression test. Do not edit code.
