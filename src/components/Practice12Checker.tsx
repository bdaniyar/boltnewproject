import { useState } from 'react';
import { formatTime } from '@/bookingLogic';
import { checkPractice12, PRACTICE12_CLOCK } from '@/practice12Availability';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '@/sampleData';

const room = SAMPLE_ROOMS.find(({ name }) => name === 'A-102')!;
const bookings = SAMPLE_BOOKINGS.filter(({ roomName }) => roomName === room.name);
const inputStyle = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2';

export function Practice12Checker() {
  const [start, setStart] = useState('12:00');
  const [duration, setDuration] = useState('60');
  const [blocked, setBlocked] = useState(room.blocked);
  const [result, setResult] = useState<ReturnType<typeof checkPractice12> | null>(null);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 text-slate-900">
      <a href="./" className="text-sm font-medium text-sky-800 underline">All campus rooms</a>
      <h1 className="mt-3 text-2xl font-bold">Smart Campus Availability</h1>
      <p className="mt-2 text-sm text-slate-700">Room {room.name} · Reference clock {formatTime(PRACTICE12_CLOCK)}</p>
      <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setResult(checkPractice12(start, duration, { ...room, blocked }, bookings));
          }}
        >
          <label className="block text-sm font-medium">
            <span className="mb-1 block">Start time (HH:MM)</span>
            <input className={inputStyle} value={start} onChange={(event) => {
              setStart(event.target.value);
              setResult(null);
            }} />
          </label>
          <label className="block text-sm font-medium">
            <span className="mb-1 block">Duration (minutes)</span>
            <input className={inputStyle} inputMode="numeric" value={duration} onChange={(event) => {
              setDuration(event.target.value);
              setResult(null);
            }} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={blocked} onChange={(event) => {
              setBlocked(event.target.checked);
              setResult(null);
            }} />
            Room blocked
          </label>
          <button type="submit" className="w-full rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800">
            Check Availability
          </button>
          <div role="status" aria-atomic="true">
            {result && (
              <div data-available={result.available} className={`rounded-lg p-3 ${result.available ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <p className="font-semibold">{result.available ? 'Available' : 'Unavailable'}</p>
                <p className="mt-1 text-sm">{result.message}</p>
                <p className="mt-1 break-words font-mono text-xs">{result.reason}</p>
              </div>
            )}
          </div>
        </form>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 id="existing-bookings" className="font-semibold">Existing bookings</h2>
          <table aria-labelledby="existing-bookings" className="mt-3 w-full text-left text-sm">
            <thead><tr><th scope="col">Start</th><th scope="col">End</th><th scope="col">Booked by</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-200">
                  <td className="py-2">{formatTime(booking.start)}</td>
                  <td>{formatTime(booking.end)}</td>
                  <td>{booking.bookedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-slate-600">Fictional bookings. Checks leave this schedule unchanged.</p>
        </section>
      </div>
    </main>
  );
}
