# Decision before the focused patch

Recorded UTC: 2026-11-05T09:31:53.255661+00:00

Baseline tests and UI are green. The maintainability issue is repeated selected-room validation, not incorrect booking behaviour. ZERO new design patterns are justified. Keep pure bookingLogic and fixtures unchanged. Replace the second BookingPanel useMemo/checkAvailability call with an AvailabilityStatus|null expression derived from liveValidation. Preserve no-room, malformed and blocked precedence; retain all JSX and component props. New characterization tests must pass original and refactored components. Before/after browser checks compare exact feedback and fixtures.
