# Inspection before application changes

Baseline Git commit: a2dff221bb65eeee5d1b20211292ed5d020905bc. Initial tracked working tree was clean. The complete tracked baseline is preserved locally in baseline/SmartCampus_Practice08_Baseline.zip. The package also supplies a smaller baseline app-source export. Existing Practice08 artefacts and history are preserved.

## Architecture and source locations

- `src/bookingLogic.ts`: pure `validateBooking` (lines65–100), `checkAvailability` (107–118), private basic range, duration and overlap checks, plus time parsing/formatting. Availability delegates to validation. The core already has a module boundary and no React imports.
- `src/App.tsx`: React state for demo rooms, selected room, fixed current time and input strings. It wires the room cards, timeline and panel. Bookings have no setter and are never saved.
- `src/components/BookingPanel.tsx`: parse input and show live validation/status, block checkbox and duration. `RoomCard.tsx`, `Timeline.tsx`, `CurrentTimeControl.tsx` provide room selection, schedule and demo clock.
- `src/sampleData.ts`: five fictional rooms and five bookings; A-102 has10:00–11:00. One consistent `Booking` format: id, roomName, start, end, bookedBy. `src/types.ts` contains the shared interfaces/status union.
- Tests: original Practice07(17), improved Practice07(43), Practice08(6) in the default Vitest configuration. Legacy Node suite(9) transpiles the actual booking module. Existing Playwright scripts verify the real Vite app; historical evidence paths must not be overwritten.

Flow: fixture data -> App React state -> pure booking validation/availability -> room cards and BookingPanel -> visible status/messages. Timeline only reads booking data. A-102 is the one-room exercise scenario; the existing five-room catalogue remains intact.

## At most three genuine maintainability findings

| Finding | Baseline reference | Assessment |
|---|---|---|
| Duplicate validation in the selected-room panel | BookingPanel.tsx:30–43 calls validateBooking and then checkAvailability; bookingLogic.ts:115 validates again | Selected: derive status from the existing validation result; remove the second memo/import. This is duplicate work, not a failing booking rule. |
| Repeated numeric range guard | bookingLogic.ts:79 and90 repeat start<end && start>=0 && end<=1440 | Small naming opportunity; defer to keep one focused refactor. Existing behaviour is correct. |
| The120-minute policy literal appears in several presentation/logic locations | bookingLogic.ts:38–41; BookingPanel.tsx:109–110; App.tsx booking-rules list | Potential drift if the requirement changes; current values agree. Defer: no policy change is required. |

## Pattern decision before implementation

ZERO new design patterns. Strategy has no second real policy to vary. Adapter has no incompatible input format to convert. Pure booking rules already live outside the UI and fixtures, so extracting them again would add a redundant module. No Singleton, Factory or classes are justified.

Selected approach: retain the existing pure-function module boundary and reuse `liveValidation` in BookingPanel. Preserve status precedence: no selected room -> no status; malformed time -> unavailable even when blocked; parsed invalid input in a blocked room -> blocked; otherwise available when valid, unavailable when invalid. Preserve every JSX label, message and class.

Baseline before any application patch:66/66 Vitest;17/17 original separately;6/6 Practice08 separately;9/9 legacy. The separate counts are subsets, not extra unique tests. Actual raw logs and exact command metadata are stored beside this inspection. Browser before:18/18 checks,14 feedback states, desktop1440×900 and mobile375×812.
