import { CheckCircle2, XCircle, Ban, Users, MapPin } from 'lucide-react';
import type { Room, Booking, AvailabilityStatus } from '@/types';
import { formatTime } from '@/bookingLogic';

interface Props {
  room: Room;
  bookings: Booking[];
  isSelected: boolean;
  onSelect: () => void;
  /** Availability preview for the currently-entered time range. */
  availability: AvailabilityStatus | null;
}

const availabilityConfig: Record<
  AvailabilityStatus,
  { label: string; icon: typeof CheckCircle2; classes: string; dot: string }
> = {
  available: {
    label: 'Available',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  unavailable: {
    label: 'Unavailable',
    icon: XCircle,
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  blocked: {
    label: 'Blocked',
    icon: Ban,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
};

export function RoomCard({ room, bookings, isSelected, onSelect, availability }: Props) {
  const roomBookings = [...bookings].sort((a, b) => a.start - b.start);
  const Icon = room.blocked ? Ban : availability ? availabilityConfig[availability].icon : Users;

  return (
    <button
      onClick={onSelect}
      disabled={room.blocked}
      className={[
        'group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-200',
        room.blocked
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
          : isSelected
            ? 'border-sky-500 bg-sky-50/50 shadow-md shadow-sky-100'
            : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{room.name}</h3>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {room.building}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          <Users className="h-3.5 w-3.5" />
          {room.capacity}
        </span>
      </div>

      {room.blocked ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
          <Ban className="h-4 w-4" />
          Blocked
        </div>
      ) : availability ? (
        <div
          className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${availabilityConfig[availability].classes}`}
        >
          <Icon className="h-4 w-4" />
          {availabilityConfig[availability].label}
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Bookings today
          </p>
          {roomBookings.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings yet</p>
          ) : (
            <ul className="space-y-0.5">
              {roomBookings.slice(0, 4).map((b) => (
                <li key={b.id} className="text-sm text-slate-600">
                  <span className="font-mono text-slate-700">
                    {formatTime(b.start)}–{formatTime(b.end)}
                  </span>
                  <span className="text-slate-400"> · {b.bookedBy}</span>
                </li>
              ))}
              {roomBookings.length > 4 && (
                <li className="text-xs text-slate-400">+{roomBookings.length - 4} more</li>
              )}
            </ul>
          )}
        </div>
      )}
    </button>
  );
}
