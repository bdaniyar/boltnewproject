# Frozen real BUG A comparison input

## Acceptance criteria
- **AC1:** reject start >= end and requests in the past.
- **AC2:** enforce maximum duration of 120 minutes.
- **AC3:** reject a blocked room.
- **AC4:** reject overlaps but allow time intervals touching at endpoints.
- **AC5:** return Available/Unavailable without modifying original booking data.
- **AC6:** preserve clear responsive desktop/mobile UI feedback.

## Deterministic environment and exact inputs

Vitest 2.1.9 and Node.js v22.22.0. This is a real controlled failure in a separate copy of baseline afcff636e723e7549f039ef688bf58b6ed9a7656. Room A-102 is unblocked, building Main, capacity 30. Fixed currentMinutes is 540 (09:00). The existing booking is { id: 'existing-1', roomName: 'A-102', start: 600, end: 660, bookedBy: 'Fictional student' }. The request is start=660 (11:00), end=720 (12:00). The targeted test is P08-A01; other tests in the same file were filtered out. The expected availability is available according to AC4.

## Relevant real code

File: src/bookingLogic.ts in the isolated defective copy. Exact before-fix file preserved as evidence/bug-a/bookingLogic.before-fix.ts.

```typescript
import type { Booking, Room, ValidationResult, AvailabilityStatus } from './types';

/**
 * AC1: Accept a booking only if 0 <= start < end <= 1440
 *      and start is after the supplied current time.
 */
function validateBasicRange(start: number, end: number, currentMinutes: number): ValidationResult {
  const messages: string[] = [];

  if (![start, end, currentMinutes].every(Number.isFinite)) {
    return {
      valid: false,
      messages: ['Start, end, and current time must be finite minute values.'],
    };
  }

  if (start < 0 || end < 0) {
    messages.push('Start and end times must not be before 00:00.');
  }
  if (start > 1440 || end > 1440) {
    messages.push('Start and end times must not exceed 24:00 (1440 minutes).');
  }
  if (!(start < end)) {
    messages.push('Start time must be earlier than end time.');
  }
  if (start <= currentMinutes) {
    messages.push(`Start time must be after the current time (${formatTime(currentMinutes)}).`);
  }

  return { valid: messages.length === 0, messages };
}

/**
 * AC2: Reject bookings longer than 120 minutes.
 */
function validateDuration(start: number, end: number): ValidationResult {
  const duration = end - start;
  if (duration > 120) {
    return {
      valid: false,
      messages: [`Booking duration is ${duration} minutes — the maximum allowed is 120 minutes.`],
    };
  }
  return { valid: true, messages: [] };
}

/**
 * AC4: Reject overlapping bookings. Touching endpoints are allowed.
 * Two ranges [s1,e1) and [s2,e2) overlap when s1 < e2 && s2 < e1.
 * Touching (e1 === s2 or e2 === s1) does NOT overlap.
 */
function hasOverlap(start: number, end: number, bookings: Booking[]): Booking | null {
  for (const b of bookings) {
    if (start <= b.end && b.start <= end) {
      return b;
    }
  }
  return null;
}

/**
 * Runs ALL acceptance-criteria checks for a proposed booking.
 * Returns a combined ValidationResult with every violation message.
 */
export function validateBooking(
  start: number,
  end: number,
  room: Room,
  existingBookings: Booking[],
  currentMinutes: number,
): ValidationResult {
  const messages: string[] = [];

  // AC1
  const rangeResult = validateBasicRange(start, end, currentMinutes);
  messages.push(...rangeResult.messages);

  // AC2 — only check duration if the range is numerically sound
  if (start < end && start >= 0 && end <= 1440) {
    const durationResult = validateDuration(start, end);
    messages.push(...durationResult.messages);
  }

  // AC3
  if (room.blocked) {
    messages.push(`Room ${room.name} is currently blocked and cannot be booked.`);
  }

  // AC4 — only check overlaps if the range is numerically sound
  if (start < end && start >= 0 && end <= 1440) {
    const roomBookings = existingBookings.filter((b) => b.roomName === room.name);
    const overlap = hasOverlap(start, end, roomBookings);
    if (overlap) {
      messages.push(
        `Overlaps existing booking by ${overlap.bookedBy} (${formatTime(overlap.start)}–${formatTime(overlap.end)}).`,
      );
    }
  }

  return { valid: messages.length === 0, messages };
}

/**
 * AC5: Determine availability status WITHOUT modifying existing booking data.
 * Returns 'blocked' for blocked rooms, 'available' if no overlap, else 'unavailable'.
 */
export function checkAvailability(
  start: number,
  end: number,
  room: Room,
  existingBookings: Booking[],
  currentMinutes: number,
): AvailabilityStatus {
  // Use the same validation for previews and form feedback so they cannot disagree.
  const result = validateBooking(start, end, room, existingBookings, currentMinutes);
  if (result.valid) return 'available';
  return room.blocked ? 'blocked' : 'unavailable';
}

/** Format minutes-from-midnight as HH:MM. */
export function formatTime(minutes: number): string {
  const m = Math.max(0, Math.min(1440, Math.round(minutes)));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Parse an "HH:MM" string into minutes from midnight. Returns null if invalid. */
export function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 24 || m < 0 || m > 59) return null;
  const total = h * 60 + m;
  if (total > 1440) return null;
  return total;
}
```

File: src/types.ts

```typescript
export interface Booking {
  id: string;
  roomName: string;
  start: number; // minutes from midnight (0–1440)
  end: number; // minutes from midnight (0–1440)
  bookedBy: string;
}

export interface Room {
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface ValidationResult {
  valid: boolean;
  messages: string[];
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'blocked';
```

## Actual failing test code

File: tests/practice08.regression.test.ts. The P08-A01 test was selected with -t P08-A01.

```typescript
import { describe, expect, test } from 'vitest';
import { checkAvailability, validateBooking } from '../src/bookingLogic';
import type { Booking, Room } from '../src/types';

const NOW = 540;
const roomFixture = (): Room => ({ name: 'A-102', building: 'Main', capacity: 30, blocked: false });
const bookingFixture = (): Booking => ({ id: 'existing-1', roomName: 'A-102', start: 600, end: 660, bookedBy: 'Fictional student' });
const unsortedFixture = (): Booking[] => [
  { id: 'later-2', roomName: 'A-102', start: 780, end: 810, bookedBy: 'Fictional tutor' },
  bookingFixture(),
];

describe('Practice08 controlled defect regressions', () => {
  test('P08-A01 endpoint after 10:00-11:00 remains available', () => {
    expect(checkAvailability(660, 720, roomFixture(), [bookingFixture()], NOW)).toBe('available');
  });

  test('P08-A02 endpoint before 10:00-11:00 remains available', () => {
    expect(checkAvailability(570, 600, roomFixture(), [bookingFixture()], NOW)).toBe('available');
  });

  test('P08-A03 true overlap still returns unavailable with conflict feedback', () => {
    const bookings = [bookingFixture()];
    expect(checkAvailability(630, 690, roomFixture(), bookings, NOW)).toBe('unavailable');
    expect(validateBooking(630, 690, roomFixture(), bookings, NOW).messages.join(' ')).toMatch(/Overlaps existing booking/);
  });

  test('P08-B01 availability preserves the original unsorted bookings', () => {
    const bookings = unsortedFixture();
    const before = bookings.map((booking) => ({ ...booking }));
    expect(checkAvailability(660, 720, roomFixture(), bookings, NOW)).toBe('available');
    expect(bookings).toEqual(before);
  });

  test('P08-B02 repeated success and rejection preserve length values and object references', () => {
    const bookings = unsortedFixture();
    const references = [...bookings];
    const before = bookings.map((booking) => ({ ...booking }));
    for (let repetition = 0; repetition < 3; repetition += 1) {
      expect(checkAvailability(660, 720, roomFixture(), bookings, NOW)).toBe('available');
      expect(checkAvailability(630, 690, roomFixture(), bookings, NOW)).toBe('unavailable');
      expect(checkAvailability(790, 820, roomFixture(), bookings, NOW)).toBe('unavailable');
    }
    expect(bookings).toHaveLength(2);
    expect(bookings).toEqual(before);
    expect(bookings[0]).toBe(references[0]);
    expect(bookings[1]).toBe(references[1]);
  });

  test('P08-B03 frozen bookings remain readable across available unavailable blocked and invalid inputs', () => {
    const bookings = unsortedFixture();
    const before = bookings.map((booking) => ({ ...booking }));
    bookings.forEach(Object.freeze);
    Object.freeze(bookings);
    expect(checkAvailability(660, 720, roomFixture(), bookings, NOW)).toBe('available');
    expect(checkAvailability(630, 690, roomFixture(), bookings, NOW)).toBe('unavailable');
    expect(checkAvailability(660, 720, { ...roomFixture(), blocked: true }, bookings, NOW)).toBe('blocked');
    expect(checkAvailability(720, 720, roomFixture(), bookings, NOW)).toBe('unavailable');
    expect(bookings).toEqual(before);
  });
});
```

## Verbatim real terminal output

Command in the isolated copy: node <project>/node_modules/vitest/vitest.mjs run tests/practice08.regression.test.ts -t P08-A01. The exact absolute executable and working-directory arguments are preserved in evidence/bug-a/red-targeted.meta.json.

```text

 RUN  v2.1.9 /private/var/folders/_x/tddpc1817tb9qpk0czts3zcr0000gn/T/practice08-bug-a-xw_waxln

 ❯ tests/practice08.regression.test.ts (6 tests | 1 failed | 5 skipped) 4ms
   × Practice08 controlled defect regressions > P08-A01 endpoint after 10:00-11:00 remains available 3ms
     → expected 'unavailable' to be 'available' // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/practice08.regression.test.ts > Practice08 controlled defect regressions > P08-A01 endpoint after 10:00-11:00 remains available
AssertionError: expected 'unavailable' to be 'available' // Object.is equality

Expected: "available"
Received: "unavailable"

 ❯ tests/practice08.regression.test.ts:15:81
     13| describe('Practice08 controlled defect regressions', () => {
     14|   test('P08-A01 endpoint after 10:00-11:00 remains available', () => {
     15|     expect(checkAvailability(660, 720, roomFixture(), [bookingFixture(…
       |                                                                                 ^
     16|   });
     17| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed (1)
      Tests  1 failed | 5 skipped (6)
   Start at  18:15:13
   Duration  387ms (transform 26ms, setup 0ms, collect 24ms, tests 4ms, environment 0ms, prepare 42ms)

```

## Diagnostic question
Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.
