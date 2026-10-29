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
