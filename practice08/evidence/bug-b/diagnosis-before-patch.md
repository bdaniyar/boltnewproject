# BUG B diagnosis before patch

Recorded at UTC: 2026-10-29T13:16:25.717773+00:00

This analysis was saved after the RED run and before changing the defective copy.

| defect | evidence | root cause | fix | test |
|---|---|---|---|---|
| BUG-B original bookings are reordered | red-targeted.txt: P08-B01 deep equality fails; later-2 moves behind existing-1 | Controlled src/bookingLogic.ts line 120 calls existingBookings.sort, which sorts the caller array in place | Delete the unnecessary sort line | P08-B01 must preserve original unsorted values and order; P08-B02 must preserve references after repeated checks; P08-B03 must support frozen fixtures |

## Reproduction and independent expected result

The clock is 540 (09:00), room A-102 is unblocked, and the request is [660,720) (11:00-12:00). Original booking order is [{id:'later-2', start:780, end:810}, {id:'existing-1', start:600, end:660}], both in A-102. AC5 requires this order and all values to remain unchanged. The availability assertion passed, but the data assertion failed because the entries became [existing-1, later-2].

## Hypothesis and confirmed explanation

The initial hypothesis was a write through the caller's array reference. The injected one-line diff calls Array.sort directly on existingBookings. The observed output shows exactly the numeric sort order, confirming the hypothesis. The endpoint condition remains the baseline strict comparison; BUG-A is absent from this fresh baseline copy. No append, removal or booking-object write was injected.

## Proposed minimal repair before implementation

Remove `existingBookings.sort((a, b) => a.start - b.start);` at line 120. Sorting is not needed: validation filters by room and scans every booking. Copying before sorting would avoid mutation but would add work with no benefit here. Run the exact previously failing test and then all original, improved and Practice08 tests. A frozen-data regression must also remain green.

## Source location correction

Appended at UTC 2026-10-29T13:17:11.278463+00:00. The numbered preserved before-fix file places the sort at line 114, not line 120. The earlier line reference was an estimate. The exact one-line diff, root cause and proposed deletion are unchanged.
