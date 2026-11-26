import { useState, useMemo, useCallback } from 'react';
import { Building2, Clock3 } from 'lucide-react';
import type { Booking, Room, AvailabilityStatus } from '@/types';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS, DEFAULT_CURRENT_MINUTES } from '@/sampleData';
import { parseTime, checkAvailability } from '@/bookingLogic';
import { CurrentTimeControl } from '@/components/CurrentTimeControl';
import { RoomCard } from '@/components/RoomCard';
import { Timeline } from '@/components/Timeline';
import { BookingPanel } from '@/components/BookingPanel';
import { Practice12Checker } from '@/components/Practice12Checker';

function CampusChecker() {
  const [rooms, setRooms] = useState<Room[]>(() => SAMPLE_ROOMS.map((room) => ({ ...room })));
  const [bookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [currentMinutes, setCurrentMinutes] = useState(DEFAULT_CURRENT_MINUTES);
  const [selectedRoomName, setSelectedRoomName] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('11:30');

  const selectedRoom = rooms.find((r) => r.name === selectedRoomName) ?? null;

  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);

  // AC5: compute availability per-room for the currently-entered time range.
  // This is a pure read — existing booking data is never modified.
  const availabilityPerRoom: Record<string, AvailabilityStatus> = useMemo(() => {
    const map: Record<string, AvailabilityStatus> = {};
    if (startMin === null || endMin === null) return map;
    for (const r of rooms) {
      map[r.name] = checkAvailability(startMin, endMin, r, bookings, currentMinutes);
    }
    return map;
  }, [rooms, bookings, currentMinutes, startMin, endMin]);

  const handleSelectRoom = useCallback((name: string) => {
    setSelectedRoomName(name);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                Smart Campus Room Checker
              </h1>
              <p className="text-xs text-slate-500">Check availability of study spaces</p>
            </div>
          </div>
          <CurrentTimeControl
            currentMinutes={currentMinutes}
            onCurrentMinutesChange={setCurrentMinutes}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left column: rooms + timeline */}
          <div className="min-w-0 space-y-6">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-700">Rooms</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {rooms.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.name}
                    room={room}
                    bookings={bookings.filter((b) => b.roomName === room.name)}
                    isSelected={selectedRoomName === room.name}
                    onSelect={() => handleSelectRoom(room.name)}
                    availability={availabilityPerRoom[room.name] ?? null}
                  />
                ))}
              </div>
            </section>

            <Timeline room={selectedRoom} bookings={bookings} />
          </div>

          {/* Right column: booking panel */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <BookingPanel
              room={selectedRoom}
              bookings={bookings}
              currentMinutes={currentMinutes}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onBlockedChange={(blocked) => {
                setRooms((currentRooms) => currentRooms.map((room) => (
                  room.name === selectedRoomName ? { ...room, blocked } : room
                )));
              }}
            />

            {/* Legend */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Clock3 className="h-4 w-4 text-slate-400" />
                Booking Rules
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>· Times must be within 00:00–24:00</li>
                <li>· Start must be after the current time</li>
                <li>· Maximum duration: 120 minutes</li>
                <li>· Blocked rooms cannot be booked</li>
                <li>· Touching endpoints are allowed (e.g. 10:00–11:00 & 11:00–12:00)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Smart Campus · Fictional sample data · No real bookings · <a href="?practice=12" className="text-sky-700 underline">Practice 12 duration checker</a>
      </footer>
    </div>
  );
}

export default function App() {
  if (new URLSearchParams(window.location.search).get('practice') === '12') {
    return <div className="min-h-screen bg-slate-50"><Practice12Checker /></div>;
  }
  return <CampusChecker />;
}
