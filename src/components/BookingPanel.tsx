import { useMemo } from 'react';
import { CalendarPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AvailabilityStatus, Booking, Room, ValidationResult } from '@/types';
import { formatTime, parseTime, validateBooking } from '@/bookingLogic';
import { prepareExplanation } from '@/explanations/context';
import { AvailabilityExplanation } from './AvailabilityExplanation';

interface Props {
  room: Room | null;
  bookings: Booking[];
  currentMinutes: number;
  startTime: string;
  endTime: string;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onBlockedChange: (blocked: boolean) => void;
}

export function BookingPanel({
  room,
  bookings,
  currentMinutes,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onBlockedChange,
}: Props) {
  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);

  const liveValidation: ValidationResult | null = useMemo(() => {
    if (!room) return null;
    const messages: string[] = [];
    if (startMin === null) messages.push('Enter a valid start time in HH:MM format (00:00–24:00).');
    if (endMin === null) messages.push('Enter a valid end time in HH:MM format (00:00–24:00).');
    if (startMin === null || endMin === null) return { valid: false, messages };
    return validateBooking(startMin, endMin, room, bookings, currentMinutes);
  }, [room, startMin, endMin, bookings, currentMinutes]);

  const liveAvailability: AvailabilityStatus | null = !room
    ? null
    : startMin === null || endMin === null
      ? 'unavailable'
      : liveValidation?.valid
        ? 'available'
        : room.blocked ? 'blocked' : 'unavailable';

  const duration =
    startMin !== null && endMin !== null && endMin > startMin ? endMin - startMin : null;


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <CalendarPlus className="h-5 w-5 text-sky-600" />
        Check Room Availability
      </h2>

      {!room ? (
        <p className="text-sm text-slate-400">Select a room to check availability.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected Room
            </span>
            <p className="font-semibold text-slate-800">
              {room.name} · {room.building}
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={room.blocked}
              onChange={(event) => onBlockedChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-sky-600"
            />
            Block selected room (demo)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Start (HH:MM)</span>
              <input
                type="text"
                required
                aria-invalid={startMin === null}
                placeholder="10:00"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">End (HH:MM)</span>
              <input
                type="text"
                required
                aria-invalid={endMin === null}
                placeholder="11:00"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </label>
          </div>

          {duration !== null && (
            <p className="text-sm text-slate-500">
              Duration: <span className="font-semibold text-slate-700">{duration} min</span>
              {duration > 120 && (
                <span className="ml-1 font-medium text-rose-600">(exceeds 120-min limit)</span>
              )}
            </p>
          )}

          {/* Live availability badge (AC5) */}
          {liveAvailability && (
            <div
              role="status"
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold',
                liveAvailability === 'available'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : liveAvailability === 'unavailable'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700',
              ].join(' ')}
            >
              {liveAvailability === 'available' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {startMin === null || endMin === null
                ? 'Unavailable — enter valid times'
                : liveAvailability === 'available'
                ? `Available for ${formatTime(startMin!)}–${formatTime(endMin!)}`
                : liveAvailability === 'unavailable'
                  ? `Unavailable for ${formatTime(startMin!)}–${formatTime(endMin!)}`
                  : 'Unavailable — room is blocked'}
            </div>
          )}

          {/* Validation messages (AC6) */}
          {liveValidation && !liveValidation.valid && (
            <ul className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-3">
              {liveValidation.messages.map((msg, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {msg}
                </li>
              ))}
            </ul>
          )}

          {liveValidation && liveAvailability && (
            <AvailabilityExplanation
              key={JSON.stringify([room.name, room.blocked, startTime, endTime, currentMinutes, liveAvailability])}
              input={prepareExplanation(room.name, startTime, endTime, liveValidation, liveAvailability)}
            />
          )}

          <p className="text-xs text-slate-500">Availability check only. No booking is saved or confirmed.</p>
        </div>
      )}
    </div>
  );
}
