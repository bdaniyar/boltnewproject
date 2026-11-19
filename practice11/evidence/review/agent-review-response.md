## Read-only agentic review

Reviewed candidate `e0db5dfb33c9672abe720a3105e81f604aac365fbc3883b8b85127f0ba1e5892` against baseline `ab36a3a97aba212d072a102f5d8ae10e745ca5b0`. I inspected the actual diff, repository instructions, feature contract, architecture, booking rules, implementation, tests and recorded results. I ran two Chrome probes against the running local candidate. I did not edit repository files.

### R11-01 — Confirmed, medium — Keyboard focus is lost while requesting an explanation

**File:** `src/components/AvailabilityExplanation.tsx:26–32, 37–44`

The pending state disables the focused native button. In Chrome, I selected A-102, focused Explain Availability, pressed Enter and waited for the mock result. Focus started on the button and ended on `BODY`, while the document still had focus. The mouse-based feature checks did not cover this. Keyboard users can lose their place while moving through the panel.

**Minimal correction:** Keep the button focusable with `aria-disabled` while loading and retain the existing synchronous `pending.current` reentry guard. Update the busy styling and add a browser assertion that keyboard focus remains on the button through completion. Verify that repeated activation during the same request starts one adapter call.

### R11-02 — Confirmed, low — Output validator does not enforce exactly one own field

**File:** `src/explanations/service.ts:17–23`

The count uses `Object.keys`, while the explanation check uses `hasOwnProperty`. They count different property sets. I imported the actual service in Chrome and passed an adapter result with one enumerable `extra` field plus a non-enumerable `explanation` with the approved sentence. The observed own keys were `["extra","explanation"]`, the enumerable keys were `["extra"]`, and the service returned source `mock`. The one-field contract calls for fallback. The approved sentence check still prevents arbitrary text from appearing. The shipped mock naturally returns the expected shape.

**Minimal correction:** Inspect the complete own-key list with `Reflect.ownKeys` and require one key equal to `explanation`. Add a unit regression using the observed shape and expect fallback. Ordinary valid responses and the displayed booking status should behave as before.

### R11-03 — Confirmed, low — Runtime evidence misses two browser scenarios

**File:** `tests/practice11-browser.mjs:11–14, 95–100, 107–120, 139–143`

The `pageerror` listener is installed only on the original page. Failure and race scenarios each open a separate page, so `pageErrors: []` describes the original page only. Assertions for B06 and B07 still verify their recorded UI outcomes. The error-evidence coverage gap follows directly from the listener placement.

**Minimal correction:** Register the same collector on every scenario page. If the repair scope stays limited to two issues, document this scope when describing the current browser runtime evidence.

### R11-04 — Plausible, low — Invalid raw time text can add render work

**File:** `src/components/BookingPanel.tsx:159–163` and `src/explanations/context.ts:55–60`

The reset key serializes both raw input values before the explanation input helper applies its length check. The new UI can therefore serialize overlong text that will never reach the adapter. Source inspection confirms the ordering. A perceptible slowdown was unverified. This is a local render concern, and the adapter receives no raw rejected input.

**Verification and recommendation:** Measure render behavior with a representative oversized paste if this becomes a priority. Consider a bounded reset identity, checking that changes still discard stale results and reset errors as intended. Avoid changing the original time parser for this explanation concern.

### R11-05 — Unsupported for the shipped flow, low — A different rejection reason could reuse the same reset key

**File:** `src/components/BookingPanel.tsx:30–45, 159–163` and `src/App.tsx:11–17`

The reset key contains selected room state, both time inputs, current time and status. It omits the derived reason code. A future caller could replace booking data while holding those values fixed, making that omission relevant. The current application has a fixed bookings state and no setter or persistence. Its interactive changes that affect the reason also change key inputs. The recorded B07 test confirms that the tested out-of-order completion could not restore an old explanation after time changes.

**Verification and recommendation:** Re-evaluate the reset identity if the component gains a changing booking source. The present Smart Campus flow supplies no evidence of this stale-result defect.

### Other review checks

The adapter is local and receives the five documented context fields. It receives no fixture records, booking-owner information or raw rejected input. The explanation renders as React text and remains separate from the confirmed status. I found no outbound model call, credential handling or booking-write path in the new feature. Code inspection shows a separate timeout and abort path with timer and listener cleanup. The recorded suite tests timeout, adapter rejection, missing adapter, contradictory content, input limits, fixture preservation and a late completion that ignores abort. The artificial 100 ms delay is a mock setting. Browser interaction times include browser and test overhead.

The recorded candidate results show 104 Vitest tests, 18 booking browser checks and seven feature browser scenarios passing. Those are existing run records, separate from my two probes. I recommend R11-01 and R11-02 as the two focused repairs, followed by the keyboard, response-shape, existing booking and browser regressions.
