import { formatTime, parseTime } from '@/bookingLogic';
import type { AvailabilityStatus, ValidationResult } from '@/types';

export const explanationText = {
  AVAILABLE: 'The room is available for the selected time.',
  BLOCKED: 'This room is blocked and cannot be booked.',
  INVALID_INTERVAL: 'The start time must be earlier than the end time.',
  PAST: 'Choose a start time after the current time.',
  TOO_LONG: 'Choose a time slot of 120 minutes or less.',
  OVERLAP: 'The selected time overlaps an existing booking.',
  UNAVAILABLE: 'The room is unavailable for the selected time.',
} as const;

type ReasonCode = keyof typeof explanationText;

export type ExplanationContext = Readonly<{
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}>;

export type ExplanationInput =
  | { context: ExplanationContext }
  | { error: string };

const MAX_TIME_LENGTH = 16;

function reasonFromDecision(
  result: ValidationResult,
  status: AvailabilityStatus,
): ReasonCode {
  if (result.valid) return 'AVAILABLE';
  if (status === 'blocked') return 'BLOCKED';

  for (const message of result.messages) {
    // The existing validator supplies these messages. Unknown wording stays generic.
    if (message === 'Start time must be earlier than end time.') return 'INVALID_INTERVAL';
    if (message.startsWith('Start time must be after the current time (')) return 'PAST';
    if (message.startsWith('Booking duration is ')) return 'TOO_LONG';
    if (message.startsWith('Overlaps existing booking by ')) return 'OVERLAP';
  }

  return 'UNAVAILABLE';
}

export function prepareExplanation(
  roomLabel: string,
  startTime: string,
  endTime: string,
  result: ValidationResult,
  status: AvailabilityStatus,
): ExplanationInput {
  if (roomLabel.length > 6 || startTime.length > MAX_TIME_LENGTH || endTime.length > MAX_TIME_LENGTH) {
    return { error: 'The room or time input is too long for an explanation.' };
  }
  if (!roomLabel.trim() || !startTime.trim() || !endTime.trim()) {
    return { error: 'Select a room and enter both times to request an explanation.' };
  }

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (!/^[A-Z]-[0-9]{3}$/.test(roomLabel) || start === null || end === null) {
    return { error: 'Use a valid room and times in HH:MM format to request an explanation.' };
  }

  return {
    context: {
      roomLabel,
      startTime: formatTime(start),
      endTime: formatTime(end),
      isAvailable: result.valid,
      reasonCode: reasonFromDecision(result, status),
    },
  };
}
