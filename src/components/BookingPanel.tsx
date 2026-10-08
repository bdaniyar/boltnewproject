import { useMemo } from 'react';
import { CalendarPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Booking, Room, ValidationResult } from '@/types';
import { formatTime, parseTime, validateBooking, checkAvailability } from '@/bookingLogic';

interface Props {
  room: Room | null;
  bookings: Booking[];
  currentMinutes: number;
  startTime: string;
  endTime: string;
  bookedBy: string;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onBookedByChange: (v: string) => void;
  onBook: () => void;
  lastResult: ValidationResult | null;
  lastBookedLabel: string | null;
}

export function BookingPanel({
  room,
  bookings,
  currentMinutes,
  startTime,
  endTime,
  bookedBy,
  onStartTimeChange,
  onEndTimeChange,
  onBookedByChange,
  onBook,
  lastResult,
  lastBookedLabel,
}: Props) {
  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);

  const liveValidation: ValidationResult | null = useMemo(() => {
    if (!room || startMin === null || endMin === null) return null;
    return validateBooking(startMin, endMin, room, bookings, currentMinutes);
  }, [room, startMin, endMin, bookings, currentMinutes]);

  const liveAvailability = useMemo(() => {
    if (!room || startMin === null || endMin === null) return null;
    return checkAvailability(startMin, endMin, room, bookings, currentMinutes);
  }, [room, startMin, endMin, bookings, currentMinutes]);

  const duration =
    startMin !== null && endMin !== null && endMin > startMin ? endMin - startMin : null;

  const canSubmit = liveValidation?.valid === true && bookedBy.trim().length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <CalendarPlus className="h-5 w-5 text-sky-600" />
        Book a Room
      </h2>

      {!room ? (
        <p className="text-sm text-slate-400">Select an available room to start booking.</p>
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

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Start (HH:MM)</span>
              <input
                type="text"
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

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Booked By</span>
            <input
              type="text"
              placeholder="e.g. Prof. Smith"
              value={bookedBy}
              onChange={(e) => onBookedByChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </label>

          {/* Live availability badge (AC5) */}
          {liveAvailability && (
            <div
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
              {liveAvailability === 'available'
                ? `Available for ${formatTime(startMin!)}–${formatTime(endMin!)}`
                : liveAvailability === 'unavailable'
                  ? `Unavailable for ${formatTime(startMin!)}–${formatTime(endMin!)}`
                  : 'Room is blocked'}
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

          {/* Success feedback */}
          {lastResult?.valid && lastBookedLabel && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Booking confirmed: {lastBookedLabel}</span>
            </div>
          )}

          <button
            onClick={onBook}
            disabled={!canSubmit}
            className={[
              'w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200',
              canSubmit
                ? 'bg-sky-600 hover:bg-sky-700 active:scale-[0.98]'
                : 'cursor-not-allowed bg-slate-300',
            ].join(' ')}
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
