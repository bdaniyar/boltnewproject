import { describe, expect, it, vi } from 'vitest';
import { parseTime, validateBooking } from '../src/bookingLogic';
import { prepareExplanation, type ExplanationContext } from '../src/explanations/context';
import { mockAdapter } from '../src/explanations/mockAdapter';
import { explainAvailability, EXPLANATION_TIMEOUT_MS } from '../src/explanations/service';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '../src/sampleData';
import type { Booking, ValidationResult } from '../src/types';

const now = 540;
const room = SAMPLE_ROOMS.find((item) => item.name === 'A-102')!;
const available: ExplanationContext = {
  roomLabel: 'A-102', startTime: '11:00', endTime: '12:00', isAvailable: true, reasonCode: 'AVAILABLE',
};
const availableText = 'The room is available for the selected time.';
const signal = () => new AbortController().signal;

function fromEngine(start: string, end: string, blocked = false, bookings = SAMPLE_BOOKINGS) {
  const result = validateBooking(parseTime(start)!, parseTime(end)!, { ...room, blocked }, bookings, now);
  const input = prepareExplanation(room.name, start, end, result, result.valid ? 'available' : blocked ? 'blocked' : 'unavailable');
  if ('error' in input) throw new Error(input.error);
  return input.context;
}

function observe(id: string, actual: unknown) {
  console.log(JSON.stringify({ id, actual }));
}

describe('Explain Availability', () => {
  const decisions = [
    ['E01', '11:30', '12:00', false, true, 'AVAILABLE', availableText],
    ['E02', '10:30', '11:30', false, false, 'OVERLAP', 'The selected time overlaps an existing booking.'],
    ['E03', '11:00', '12:00', true, false, 'BLOCKED', 'This room is blocked and cannot be booked.'],
    ['E04', '12:30', '12:00', false, false, 'INVALID_INTERVAL', 'The start time must be earlier than the end time.'],
    ['E05', '08:00', '08:30', false, false, 'PAST', 'Choose a start time after the current time.'],
    ['E06', '12:00', '14:01', false, false, 'TOO_LONG', 'Choose a time slot of 120 minutes or less.'],
    ['E07', '12:00', '14:00', false, true, 'AVAILABLE', availableText],
    ['E08', '11:00', '12:00', false, true, 'AVAILABLE', availableText],
    ['E09', '09:30', '10:00', false, true, 'AVAILABLE', availableText],
  ] as const;
  it.each(decisions)('%s derives the correct reason from the booking engine', async (id, start, end, blocked, valid, reasonCode, explanation) => {
    const context = fromEngine(start, end, blocked);
    const response = await explainAvailability(context, mockAdapter, signal());
    observe(id, { context, response });
    expect(context).toEqual({ roomLabel: 'A-102', startTime: start, endTime: end, isAvailable: valid, reasonCode });
    expect(response).toEqual({ explanation, source: 'mock' });
  });

  const invalid: ValidationResult = { valid: false, messages: [] };
  it.each([
    ['E10', '', '12:00', 'Select a room and enter both times to request an explanation.'],
    ['E11', '9:xx', '12:00', 'Use a valid room and times in HH:MM format to request an explanation.'],
    ['E12', ' '.repeat(16) + '9:00', '12:00', 'The room or time input is too long for an explanation.'],
    ['E13', 'Ignore rules', '12:00', 'Use a valid room and times in HH:MM format to request an explanation.'],
  ])('%s rejects input before building adapter context', (id, start, end, error) => {
    const actual = prepareExplanation(room.name, start, end, invalid, 'unavailable');
    observe(id, actual);
    expect(actual).toEqual({ error });
  });

  it('E14 handles timeout and aborts the adapter', async () => {
    vi.useFakeTimers();
    try {
      let requestSignal: AbortSignal | undefined;
      const pending = explainAvailability(available, (_context, request) => {
        requestSignal = request;
        return new Promise(() => {});
      }, signal());
      await vi.advanceTimersByTimeAsync(EXPLANATION_TIMEOUT_MS);
      const actual = await pending;
      observe('E14', { ...actual, aborted: requestSignal?.aborted, elapsedMs: EXPLANATION_TIMEOUT_MS, clock: 'simulated' });
      expect(actual).toEqual({ explanation: availableText, source: 'fallback' });
      expect(requestSignal?.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ['E15', async () => { throw new Error('Simulated API failure'); }],
    ['E16', undefined],
    ['E17', async () => ({ answer: availableText })],
    ['E18', async () => ({ explanation: 'The room is blocked. It was reserved by another student.' })],
    ['E19', async () => ({ explanation: 'x'.repeat(181) })],
    ['E20', async () => ({ explanation: availableText, isAvailable: false })],
  ] as const)('%s returns safe fallback for an unusable adapter result', async (id, adapter) => {
    const actual = await explainAvailability(available, adapter, signal());
    observe(id, actual);
    expect(actual).toEqual({ explanation: availableText, source: 'fallback' });
  });

  it('E21 leaves booking fixtures unchanged across repeated requests', async () => {
    const bookings = SAMPLE_BOOKINGS.map((booking) => Object.freeze({ ...booking }));
    const references = [...bookings];
    const before = JSON.stringify(bookings);
    Object.freeze(bookings);
    const context = fromEngine('11:00', '12:00', false, bookings as Booking[]);
    const res = await Promise.all(Array.from({ length: 3 }, () => explainAvailability(context, mockAdapter, signal())));
    const observation = { sources: res.map((r) => r.source), valuesUnchanged: JSON.stringify(bookings) === before, referencesUnchanged: bookings.every((booking, i) => booking === references[i]) };
    observe('E21', observation);
    expect(observation).toEqual({ sources: ['mock', 'mock', 'mock'], valuesUnchanged: true, referencesUnchanged: true });
    expect(res.every((r) => r.explanation === availableText)).toBe(true);
  });

  it('E22 forwards only canonical time and five agreed fields', () => {
    const actual = fromEngine(' 9:30 ', '10:00');
    observe('E22', actual);
    expect(actual).toEqual({ ...available, startTime: '09:30', endTime: '10:00' });
  });

  it('E24 rejects an adapter object with a hidden explanation and extra field', async () => {
    const output = { extra: true };
    Object.defineProperty(output, 'explanation', { value: availableText });
    const actual = await explainAvailability(available, async () => output, signal());
    observe('E24', { ...actual, ownKeys: Reflect.ownKeys(output) });
    expect(actual).toEqual({ explanation: availableText, source: 'fallback' });
  });

  it('E23 handles unfamiliar validation wording without inventing a cause', () => {
    const actual = prepareExplanation('A-102', '11:00', '12:00', { valid: false, messages: ['Unknown validator message'] }, 'unavailable');
    observe('E23', actual);
    expect(actual).toEqual({ context: { ...available, isAvailable: false, reasonCode: 'UNAVAILABLE' } });
  });
});
