# Request flow and trust boundary

Room and time controls → existing parser and booking validator → confirmed status in the booking panel.

On Explain Availability → check input length and format → project the confirmed result into five fields → local mock adapter → validate response → separate explanation region.

Timeout, adapter error, missing adapter and rejected output route to the same deterministic fallback. A changed request cancels pending work and clears its explanation. The adapter receives neither booking fixtures nor owner names. Only the existing checker decides availability. A future network adapter would cross a separate server boundary with server-only credentials.
