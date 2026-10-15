import { Clock } from 'lucide-react';
import { formatTime } from '@/bookingLogic';

interface Props {
  currentMinutes: number;
  onCurrentMinutesChange: (minutes: number) => void;
}

export function CurrentTimeControl({ currentMinutes, onCurrentMinutesChange }: Props) {
  const hours = Math.floor(currentMinutes / 60);
  const minutes = currentMinutes % 60;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-2.5">
      <Clock className="h-5 w-5 text-sky-400" />
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Current Time
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            aria-label="Current hour"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => {
              const h = Math.max(0, Math.min(23, Number(e.target.value) || 0));
              onCurrentMinutesChange(h * 60 + minutes);
            }}
            className="w-10 bg-slate-900 text-right text-sm font-semibold text-white rounded px-1 py-0.5 border border-slate-700 focus:border-sky-500 focus:outline-none"
          />
          <span className="text-white font-semibold">:</span>
          <input
            type="number"
            aria-label="Current minute"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => {
              const m = Math.max(0, Math.min(59, Number(e.target.value) || 0));
              onCurrentMinutesChange(hours * 60 + m);
            }}
            className="w-10 bg-slate-900 text-right text-sm font-semibold text-white rounded px-1 py-0.5 border border-slate-700 focus:border-sky-500 focus:outline-none"
          />
          <span className="ml-1 text-sm font-mono text-slate-300">
            ({formatTime(currentMinutes)})
          </span>
        </div>
      </div>
    </div>
  );
}
