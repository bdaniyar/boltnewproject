import { describe, expect, test } from 'vitest';
import { checkAvailability, validateBooking } from '../src/bookingLogic';
import type { Booking, Room } from '../src/types';

// Original generated suite: retain unchanged as the first-suite evidence.
const NOW = 540;
const roomFixture = (): Room => ({ name: 'A-102', building: 'Main', capacity: 30, blocked: false });
const bookingFixture = (): Booking[] => [
  { id: 'existing-1', roomName: 'A-102', start: 600, end: 660, bookedBy: 'Fictional student' },
];

function assertOutcome(start: number, end: number, expected: boolean, room = roomFixture(), bookings = bookingFixture()) {
  const result = validateBooking(start, end, room, bookings, NOW);
  expect(result.valid).toBe(expected);
  expect(checkAvailability(start, end, room, bookings, NOW)).toBe(
    room.blocked ? 'blocked' : expected ? 'available' : 'unavailable',
  );
  if (expected) expect(result.messages).toEqual([]);
  else expect(result.messages.length).toBeGreaterThan(0);
}

describe('Practice07 original suite — fixed now 09:00', () => {
  test('T01 touching after the existing booking is allowed', () => assertOutcome(660, 720, true));
  test('T02 starting exactly now is rejected', () => assertOutcome(540, 570, false));
  test('T03 zero duration is rejected', () => assertOutcome(720, 720, false));
  test('T04 reversed interval is rejected', () => assertOutcome(750, 720, false));
  test('T05 end beyond the same day is rejected', () => assertOutcome(1380, 1441, false));
  test('T06 exactly 120 minutes is allowed', () => assertOutcome(720, 840, true));
  test('T07 121 minutes is rejected', () => assertOutcome(720, 841, false));
  test('T08 touching before the existing booking is allowed', () => assertOutcome(570, 600, true));
  test('T09 partial overlap is rejected', () => assertOutcome(630, 690, false));
  test('T10 containing the existing booking is rejected', () => assertOutcome(570, 690, false));
  test('T11 being inside the existing booking is rejected', () => assertOutcome(615, 645, false));
  test('T12 identical interval is rejected', () => assertOutcome(600, 660, false));
  test('T13 blocked room rejects a free interval', () => assertOutcome(660, 720, false, { ...roomFixture(), blocked: true }));
  test('T14 empty booking list allows the interval', () => assertOutcome(630, 690, true, roomFixture(), []));
  test('T15 checking availability preserves booking data', () => {
    const bookings = bookingFixture();
    const before = JSON.parse(JSON.stringify(bookings));
    assertOutcome(660, 720, true, roomFixture(), bookings);
    expect(bookings).toEqual(before);
  });
  test('T16 negative start is rejected', () => assertOutcome(-1, 60, false));
  test('T17 overlap with a later existing booking is rejected', () => {
    const bookings = [...bookingFixture(), { id: 'existing-2', roomName: 'A-102', start: 780, end: 810, bookedBy: 'Fictional tutor' }];
    assertOutcome(790, 820, false, roomFixture(), bookings);
  });
});
