# Explain Availability feature contract

As a student, I want a short explanation of room availability so I understand the decision.

A student selects a fictional room and enters start and end times in the existing panel. A-102 is the exercise room. The Explain Availability button is optional. The current panel status remains the source shown for the confirmed decision. The checker remains an availability check and never saves a booking.

The explanation input gate rejects empty, malformed or overlong time text before calling the adapter. The limit is 16 characters per raw time field and six for a room label in the existing A-102 style. The existing time parser normalizes accepted values to HH:MM. A parseable reversed interval is a deterministic rejection and can be explained. Bookings, owner names, validation messages and raw time input stay outside the adapter context.

| Field | Meaning |
|---|---|
| roomLabel | Fictional room code |
| startTime | Canonical HH:MM start |
| endTime | Canonical HH:MM end |
| isAvailable | Existing validator's boolean |
| reasonCode | Fixed code derived from the current decision and its validation messages |

The explanation shows one main reason. Available uses AVAILABLE. A displayed blocked status uses BLOCKED, matching the existing panel's precedence. Other failures use the first recognized validator message in its existing order. The supported codes are INVALID_INTERVAL, PAST, TOO_LONG and OVERLAP. An unrecognized rejection uses UNAVAILABLE. The mapping does not run a second overlap, duration or past-time check.

The local mock adapter accepts those five fields and returns a promise of an object with one explanation string. Its simulated wait is 100 ms. The response must have exactly the explanation field and contain an approved sentence for that reason, at most 180 characters and no more than two sentences. The conservative sentence list prevents conflicting or invented details. The mock returns one sentence per reason.

The button shows progress and displays the result in a separate live region labeled Mock explanation. A failed request, unavailable adapter, timeout at 1,500 ms, or rejected response uses a deterministic sentence labeled Fallback explanation. An input error shows local guidance and sends no adapter request. Changing the request resets the explanation and cancels pending work. The button prevents another request while its current request is pending.

A real model would require a separately approved server-side adapter. The same five fields, output validation and fallback would apply, and any credentials would stay on that server. This classroom demonstration runs locally without an API key.
