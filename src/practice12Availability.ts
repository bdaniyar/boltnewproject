import { formatTime, parseTime, validateBooking } from './bookingLogic';
import type { Booking, Room } from './types';

export const PRACTICE12_CLOCK = 9 * 60;

const messages = {
  INVALID_START: 'Enter a valid start time in HH:MM format.',
  START_NOT_FUTURE: `Start time must be after ${formatTime(PRACTICE12_CLOCK)}.`,
  INVALID_DURATION: 'Enter a whole-number duration from 1 to 120 minutes.',
  END_OUT_OF_DAY: 'The interval must end by 24:00.',
  ROOM_BLOCKED: 'Room A-102 is blocked.',
  BOOKING_OVERLAP: 'This interval overlaps an existing booking.',
  AVAILABLE: 'Room A-102 is available for this interval.',
};

function decision(reason: keyof typeof messages) {
  return { available: reason === 'AVAILABLE', reason, message: messages[reason] };
}

export function checkPractice12(startText: string, durationText: string, room: Room, bookings: Booking[]) {
  const start = parseTime(startText);
  if (start === null) return decision('INVALID_START');
  if (start <= PRACTICE12_CLOCK) return decision('START_NOT_FUTURE');

  const duration = Number(durationText);
  if (!/^\d+$/.test(durationText.trim()) || duration < 1 || duration > 120) {
    return decision('INVALID_DURATION');
  }

  const end = start + duration;
  if (end > 1440) return decision('END_OUT_OF_DAY');

  const validation = validateBooking(start, end, room, bookings, PRACTICE12_CLOCK);
  if (validation.valid) return decision('AVAILABLE');
  return decision(room.blocked ? 'ROOM_BLOCKED' : 'BOOKING_OVERLAP');
}
