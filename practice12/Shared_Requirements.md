# Practice 12 shared requirements

**User story.** As a student, I want to check whether a campus room is available for a selected start time and duration so that I can choose a valid time.

| ID | Acceptance criterion (lesson 12, p. 13) |
|---|---|
| AC1 | Start time must be in the future. |
| AC2 | Duration must be greater than zero and at most 120 minutes. |
| AC3 | Overlapping bookings are unavailable. |
| AC4 | A blocked room is unavailable. |
| AC5 | Display a clear decision without changing existing bookings. |
| AC6 | Invalid input receives understandable feedback. |

**Frozen inputs.** Room A-102 from `src/sampleData.ts` at `ab2ccb4103ef3b9c9b800994616cb99db881f0be`. Booking `b3` is 10:00–11:00 (600–660 minutes), fictional owner Lab Team 3. This is the only A-102 booking. The comparison fixes the supplied clock at 09:00 (540 minutes); the original multi-room view keeps its editable clock and initial 10:00. The caller enters start time, integer minutes and a blocked flag (default off). Start accepts H:MM or HH:MM with outer spaces trimmed, as in the original parser. Duration accepts decimal digits with outer spaces trimmed. A check reads existing bookings and produces a boolean, a reason code and a visible message. It never creates or changes a booking.

**Decision precedence.** The first matching row wins. End is start plus duration. The existing engine allows an end of 24:00 and endpoint touching.

| Order | Condition | Available | Reason code | Visible message |
|---|---|---|---|---|
| 1 | Start missing or malformed | false | INVALID_START | Enter a valid start time in HH:MM format. |
| 2 | Start at or before 09:00 | false | START_NOT_FUTURE | Start time must be after 09:00. |
| 3 | Duration missing, malformed or outside 1–120 whole minutes | false | INVALID_DURATION | Enter a whole-number duration from 1 to 120 minutes. |
| 4 | End after 24:00 | false | END_OUT_OF_DAY | The interval must end by 24:00. |
| 5 | Room blocked | false | ROOM_BLOCKED | Room A-102 is blocked. |
| 6 | Half-open interval overlaps a booking | false | BOOKING_OVERLAP | This interval overlaps an existing booking. |
| 7 | None of the previous conditions | true | AVAILABLE | Room A-102 is available for this interval. |

**Frozen comparison tests.** The same cases run through both UIs. T8 compares the room's displayed booking data before and after T1–T7 in one browser session. The source and original regression suites cover fixture data and behavior beyond that UI observation. The earlier Explain Availability feature is outside this comparison.
