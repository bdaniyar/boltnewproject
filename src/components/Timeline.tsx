import type { Booking, Room } from '@/types';
import { formatTime } from '@/bookingLogic';

interface Props {
  room: Room | null;
  bookings: Booking[];
}

const HOUR_PX = 56; // width per hour in pixels
const TOTAL_PX = HOUR_PX * 24;

export function Timeline({ room, bookings }: Props) {
  if (!room) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400">
        Select a room to view its schedule timeline.
      </div>
    );
  }

  const roomBookings = bookings.filter((b) => b.roomName === room.name);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Today's Schedule — {room.name}</h3>
        <span className="text-xs text-slate-400">00:00 → 24:00</span>
      </div>

      <div className="overflow-x-auto">
        <div className="relative" style={{ width: TOTAL_PX, minWidth: '100%' }}>
          {/* Hour grid */}
          <div className="flex h-10 border-b border-slate-200">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="flex items-start justify-start border-r border-slate-100 text-[10px] text-slate-400"
                style={{ width: HOUR_PX }}
              >
                <span className="ml-1 -translate-y-0.5">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Booking bars */}
          <div className="relative h-12" style={{ width: TOTAL_PX }}>
            {room.blocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-amber-50/60 text-sm font-medium text-amber-600">
                This room is blocked
              </div>
            )}
            {roomBookings.map((b) => {
              const left = (b.start / 1440) * TOTAL_PX;
              const width = ((b.end - b.start) / 1440) * TOTAL_PX;
              return (
                <div
                  key={b.id}
                  className="absolute top-1.5 flex h-9 items-center rounded-lg bg-sky-500 px-2 text-xs font-medium text-white shadow-sm"
                  style={{ left, width: Math.max(width - 2, 20) }}
                  title={`${b.bookedBy} · ${formatTime(b.start)}–${formatTime(b.end)}`}
                >
                  <span className="truncate">{formatTime(b.start)}–{formatTime(b.end)}</span>
                </div>
              );
            })}
            {!room.blocked && roomBookings.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-slate-300">
                No bookings — the entire day is open.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
