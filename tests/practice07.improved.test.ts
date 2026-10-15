import { describe, expect, test } from 'vitest';
import { checkAvailability, formatTime, parseTime, validateBooking } from '../src/bookingLogic';
import type { AvailabilityStatus, Booking, Room } from '../src/types';

const NOW = 540;
const roomFixture = (): Room => ({ name: 'A-102', building: 'Main', capacity: 30, blocked: false });
const bookingFixture = (): Booking[] => [
  { id: 'existing-1', roomName: 'A-102', start: 600, end: 660, bookedBy: 'Fictional student' },
];
const anotherBooking = (): Booking => ({ id: 'existing-2', roomName: 'A-102', start: 780, end: 810, bookedBy: 'Fictional tutor' });

function assertOutcome(
  start: number,
  end: number,
  expected: boolean,
  room = roomFixture(),
  bookings = bookingFixture(),
  now = NOW,
  messagePattern?: RegExp,
) {
  const result = validateBooking(start, end, room, bookings, now);
  const expectedStatus: AvailabilityStatus = room.blocked ? 'blocked' : expected ? 'available' : 'unavailable';
  expect(result.valid).toBe(expected);
  expect(checkAvailability(start, end, room, bookings, now)).toBe(expectedStatus);
  if (expected) expect(result.messages).toEqual([]);
  else expect(result.messages.length).toBeGreaterThan(0);
  if (messagePattern) expect(result.messages.join(' ')).toMatch(messagePattern);
}

describe('Practice07 improved suite — real booking logic with fixed fixtures', () => {
  test('T01 touching after the existing booking is allowed', () => assertOutcome(660, 720, true));
  test('T02 starting exactly now is rejected with current-time feedback', () => assertOutcome(540, 570, false, roomFixture(), bookingFixture(), NOW, /after.*current time/i));
  test('T03 zero duration is rejected with order feedback', () => assertOutcome(720, 720, false, roomFixture(), bookingFixture(), NOW, /earlier than end/i));
  test('T04 reversed interval is rejected with order feedback', () => assertOutcome(750, 720, false, roomFixture(), bookingFixture(), NOW, /earlier than end/i));
  test('T05 end beyond the same day is rejected with boundary feedback', () => assertOutcome(1380, 1441, false, roomFixture(), bookingFixture(), NOW, /24:00|1440/i));
  test('T06 exactly 120 minutes is allowed', () => assertOutcome(720, 840, true));
  test('T07 121 minutes is rejected with duration feedback', () => assertOutcome(720, 841, false, roomFixture(), bookingFixture(), NOW, /maximum.*120/i));
  test('T08 touching before the existing booking is allowed', () => assertOutcome(570, 600, true));
  test('T09 partial overlap is rejected with conflict feedback', () => assertOutcome(630, 690, false, roomFixture(), bookingFixture(), NOW, /overlap.*Fictional student/i));
  test('T10 containing the existing booking is rejected', () => assertOutcome(570, 690, false));
  test('T11 being inside the existing booking is rejected', () => assertOutcome(615, 645, false));
  test('T12 identical interval is rejected', () => assertOutcome(600, 660, false));
  test('T13 blocked room rejects a free interval with room feedback', () => assertOutcome(660, 720, false, { ...roomFixture(), blocked: true }, bookingFixture(), NOW, /A-102.*blocked/i));
  test('T14 empty booking list allows the interval', () => assertOutcome(630, 690, true, roomFixture(), []));
  test('T15 repeated successful and rejected checks preserve frozen array and booking objects', () => {
    const bookings = [anotherBooking(), ...bookingFixture()];
    const arrayReference = bookings;
    const objectReferences = [...bookings];
    const before = bookings.map((booking) => ({ ...booking }));
    const room = roomFixture();
    for (const booking of bookings) Object.freeze(booking);
    Object.freeze(bookings);
    Object.freeze(room);

    assertOutcome(660, 720, true, room, bookings);
    assertOutcome(630, 690, false, room, bookings);
    assertOutcome(790, 820, false, room, bookings);
    assertOutcome(660, 720, true, room, bookings);

    expect(bookings).toBe(arrayReference);
    expect(bookings).toEqual(before);
    expect(bookings[0]).toBe(objectReferences[0]);
    expect(bookings[1]).toBe(objectReferences[1]);
    expect(Object.isFrozen(bookings)).toBe(true);
    expect(bookings.every(Object.isFrozen)).toBe(true);
    expect(room).toEqual(roomFixture());
  });
  test('T16 negative start is rejected with day-boundary feedback', () => assertOutcome(-1, 60, false, roomFixture(), bookingFixture(), NOW, /00:00/i));
  test('T17 later overlap is found in an unsorted multi-booking list', () => {
    // The first entry does not conflict. The second does: inspecting only the first is wrong.
    const bookings = [anotherBooking(), ...bookingFixture()];
    assertOutcome(630, 690, false, roomFixture(), bookings, NOW, /Fictional student/i);
    assertOutcome(790, 820, false, roomFixture(), bookings, NOW, /Fictional tutor/i);
  });
  test('T18 negative end is rejected', () => assertOutcome(550, -1, false));
  test('T19 exactly 24:00 end is allowed', () => assertOutcome(1320, 1440, true));
  test('T20 one-minute future booking is allowed', () => assertOutcome(541, 542, true));
  test('T21 start before now is rejected', () => assertOutcome(539, 570, false));
  test('T22 overlap entering the existing interval from the left is rejected', () => assertOutcome(570, 630, false));
  test('T23 another room booking does not cause a conflict', () => {
    const bookings = bookingFixture().map((booking) => ({ ...booking, roomName: 'B-201' }));
    assertOutcome(630, 690, true, roomFixture(), bookings);
  });
  test('T24 free gap between unsorted bookings is available', () => assertOutcome(660, 720, true, roomFixture(), [anotherBooking(), ...bookingFixture()]));

  // Valid time values must be finite, including the supplied reference clock.
  test.each<[string, string, number]>([
    ['T25', 'NaN', Number.NaN],
    ['T26', 'Infinity', Number.POSITIVE_INFINITY],
    ['T27', '-Infinity', Number.NEGATIVE_INFINITY],
  ])('%s non-finite start %s is rejected by validator and status', (_id, _label, value) => assertOutcome(value, 720, false));
  test.each<[string, string, number]>([
    ['T28', 'NaN', Number.NaN],
    ['T29', 'Infinity', Number.POSITIVE_INFINITY],
    ['T30', '-Infinity', Number.NEGATIVE_INFINITY],
  ])('%s non-finite end %s is rejected by validator and status', (_id, _label, value) => assertOutcome(660, value, false));
  test.each<[string, string, number]>([
    ['T31', 'NaN', Number.NaN],
    ['T32', 'Infinity', Number.POSITIVE_INFINITY],
    ['T33', '-Infinity', Number.NEGATIVE_INFINITY],
  ])('%s non-finite current time %s is rejected by validator and status', (_id, _label, value) => assertOutcome(660, 720, false, roomFixture(), bookingFixture(), value));

  test.each<[string, string, number | null]>([
    ['T34', '00:00', 0],
    ['T35', '24:00', 1440],
    ['T36', '24:01', null],
    ['T37', '12:60', null],
    ['T38', '', null],
    ['T39', 'abc', null],
    ['T40', '09:0', null],
    ['T41', ' 09:00 ', 540],
  ])('%s parser boundary or invalid input %j', (_id, input, expected) => expect(parseTime(input)).toBe(expected));
  test('T42 day-end format remains 24:00', () => expect(formatTime(1440)).toBe('24:00'));
  test('T43 midnight format remains 00:00', () => expect(formatTime(0)).toBe('00:00'));
});
