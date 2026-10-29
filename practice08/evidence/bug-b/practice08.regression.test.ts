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
