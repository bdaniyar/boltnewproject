export default {
  clock: 540,
  bookings: [{ start: 600, end: 660, bookedBy: 'Lab Team 3' }],

  format(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    return hours + ':' + String(minutes % 60).padStart(2, '0');
  },

  bookingRows() {
    return this.bookings.map(({ start, end, bookedBy }) => ({
      Start: this.format(start),
      End: this.format(end),
      BookedBy: bookedBy,
    }));
  },

  check(startText, durationText, blocked) {
    const result = (reason, message) => ({
      available: reason === 'AVAILABLE',
      reason,
      message,
      inputs: [startText, durationText, blocked],
    });

    const match = /^(\d{1,2}):(\d{2})$/.exec(startText.trim());
    const start = match && Number(match[1]) * 60 + Number(match[2]);
    if (!match || Number(match[2]) > 59 || start > 1440) {
      return result('INVALID_START', 'Enter a valid start time in HH:MM format.');
    }
    if (start <= this.clock) {
      return result('START_NOT_FUTURE', 'Start time must be after 09:00.');
    }
    const duration = Number(durationText);
    if (!/^\d+$/.test(durationText.trim()) || duration < 1 || duration > 120) {
      return result('INVALID_DURATION', 'Enter a whole-number duration from 1 to 120 minutes.');
    }
    const end = start + duration;
    if (end > 1440) {
      return result('END_OUT_OF_DAY', 'The interval must end by 24:00.');
    }
    if (blocked) {
      return result('ROOM_BLOCKED', 'Room A-102 is blocked.');
    }
    if (this.bookings.some((booking) => start < booking.end && booking.start < end)) {
      return result('BOOKING_OVERLAP', 'This interval overlaps an existing booking.');
    }
    return result('AVAILABLE', 'Room A-102 is available for this interval.');
  },
}
