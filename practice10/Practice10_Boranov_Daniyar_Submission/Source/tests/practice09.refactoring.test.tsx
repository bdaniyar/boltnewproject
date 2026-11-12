import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { BookingPanel } from '../src/components/BookingPanel';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '../src/sampleData';
import type { Booking, Room } from '../src/types';

const NOW = 540;
const roomFixture = (blocked = false): Room => ({
  ...SAMPLE_ROOMS.find((room) => room.name === 'A-102')!,
  blocked,
});

function renderPanel(startTime: string, endTime: string, room: Room | null = roomFixture(), bookings: Booking[] = SAMPLE_BOOKINGS) {
  return renderToStaticMarkup(
    <BookingPanel
      room={room}
      bookings={bookings}
      currentMinutes={NOW}
      startTime={startTime}
      endTime={endTime}
      onStartTimeChange={() => {}}
      onEndTimeChange={() => {}}
      onBlockedChange={() => {}}
    />,
  );
}

function statusFrom(html: string) {
  const match = /<div\b(?=[^>]*\brole="status")([^>]*)>([\s\S]*?)<\/div>/.exec(html);
  expect(match, 'The selected room must render its real status element').not.toBeNull();
  return {
    classes: /\bclass="([^"]*)"/.exec(match![1])?.[1] ?? '',
    text: match![2].replace(/<[^>]*>/g, ''),
  };
}

type PanelCase = {
  id: string;
  start: string;
  end: string;
  blocked?: boolean;
  status: string;
  colour: 'rose' | 'amber' | 'emerald';
  feedback: string[];
};

const cases: PanelCase[] = [
  { id: 'P09-01 past start', start: '08:00', end: '08:30', status: 'Unavailable for 08:00–08:30', colour: 'rose', feedback: ['Start time must be after the current time (09:00).'] },
  { id: 'P09-02 reversed range', start: '12:30', end: '12:00', status: 'Unavailable for 12:30–12:00', colour: 'rose', feedback: ['Start time must be earlier than end time.'] },
  { id: 'P09-03 duration 121 minutes', start: '12:00', end: '14:01', status: 'Unavailable for 12:00–14:01', colour: 'rose', feedback: ['Booking duration is 121 minutes — the maximum allowed is 120 minutes.'] },
  { id: 'P09-04 blocked room', start: '11:00', end: '12:00', blocked: true, status: 'Unavailable — room is blocked', colour: 'amber', feedback: ['Room A-102 is currently blocked and cannot be booked.'] },
  { id: 'P09-05 genuine overlap', start: '10:30', end: '11:30', status: 'Unavailable for 10:30–11:30', colour: 'rose', feedback: ['Overlaps existing booking by Lab Team 3 (10:00–11:00).'] },
  { id: 'P09-06 touching after booking', start: '11:00', end: '12:00', status: 'Available for 11:00–12:00', colour: 'emerald', feedback: [] },
  { id: 'P09-07 touching before booking', start: '09:30', end: '10:00', status: 'Available for 09:30–10:00', colour: 'emerald', feedback: [] },
  { id: 'P09-08 duration exactly 120 minutes', start: '12:00', end: '14:00', status: 'Available for 12:00–14:00', colour: 'emerald', feedback: [] },
  { id: 'P09-09 malformed start', start: 'bad', end: '12:00', status: 'Unavailable — enter valid times', colour: 'rose', feedback: ['Enter a valid start time in HH:MM format (00:00–24:00).'] },
  { id: 'P09-10 malformed end', start: '11:00', end: 'bad', status: 'Unavailable — enter valid times', colour: 'rose', feedback: ['Enter a valid end time in HH:MM format (00:00–24:00).'] },
  { id: 'P09-11 malformed start takes priority over blocked style', start: 'bad', end: '12:00', blocked: true, status: 'Unavailable — enter valid times', colour: 'rose', feedback: ['Enter a valid start time in HH:MM format (00:00–24:00).'] },
  { id: 'P09-12 malformed end takes priority over blocked style', start: '11:00', end: 'bad', blocked: true, status: 'Unavailable — enter valid times', colour: 'rose', feedback: ['Enter a valid end time in HH:MM format (00:00–24:00).'] },
  { id: 'P09-13 parsed invalid range keeps blocked style and both messages', start: '12:30', end: '12:00', blocked: true, status: 'Unavailable — room is blocked', colour: 'amber', feedback: ['Start time must be earlier than end time.', 'Room A-102 is currently blocked and cannot be booked.'] },
];

describe('Practice09 real BookingPanel behaviour before and after refactoring', () => {
  test.each(cases)('$id', ({ start, end, blocked, status, colour, feedback }) => {
    const html = renderPanel(start, end, roomFixture(blocked));
    const renderedStatus = statusFrom(html);
    expect(renderedStatus.text).toBe(status);
    expect(renderedStatus.classes.split(' ')).toContain(`border-${colour}-200`);
    expect(renderedStatus.classes.split(' ')).toContain(`bg-${colour}-50`);
    expect(renderedStatus.classes.split(' ')).toContain(`text-${colour}-700`);
    for (const message of feedback) expect(html).toContain(message);
    if (feedback.length === 0) expect(html).not.toContain('<ul');
    if (start === 'bad' || end === 'bad') {
      expect(html).toContain('aria-invalid="true"');
      expect(html).not.toContain('Room A-102 is currently blocked and cannot be booked.');
    }
    expect(html).toContain('Availability check only. No booking is saved or confirmed.');
  });

  test('P09-14 no room selection has guidance and no status or booking controls', () => {
    const html = renderPanel('11:00', '12:00', null);
    expect(html).toContain('Select a room to check availability.');
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain('Start (HH:MM)');
    expect(html).not.toContain('Block selected room (demo)');
  });

  test('P09-15 repeated real-component renders preserve all frozen sample booking data', () => {
    const arrayReference = SAMPLE_BOOKINGS;
    const objectReferences = [...SAMPLE_BOOKINGS];
    const before = SAMPLE_BOOKINGS.map((booking) => ({ ...booking }));
    SAMPLE_BOOKINGS.forEach(Object.freeze);
    Object.freeze(SAMPLE_BOOKINGS);

    for (let repetition = 0; repetition < 3; repetition += 1) {
      for (const scenario of cases) {
        const html = renderPanel(scenario.start, scenario.end, roomFixture(scenario.blocked));
        expect(statusFrom(html).text).toBe(scenario.status);
      }
      renderPanel('11:00', '12:00', null);
    }

    expect(SAMPLE_BOOKINGS).toBe(arrayReference);
    expect(SAMPLE_BOOKINGS).toHaveLength(5);
    expect(SAMPLE_BOOKINGS).toEqual(before);
    SAMPLE_BOOKINGS.forEach((booking, index) => {
      expect(booking).toBe(objectReferences[index]);
      expect(Object.isFrozen(booking)).toBe(true);
    });
    expect(Object.isFrozen(SAMPLE_BOOKINGS)).toBe(true);
  });
});
