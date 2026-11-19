import { useEffect, useRef, useState } from 'react';
import type { ExplanationInput } from '@/explanations/context';
import { mockAdapter } from '@/explanations/mockAdapter';
import { explainAvailability } from '@/explanations/service';
import type { Explanation } from '@/explanations/service';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'result'; result: Explanation };

export function AvailabilityExplanation({ input }: { input: ExplanationInput }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  async function explain() {
    if (pending.current) return;
    if ('error' in input) {
      setState({ kind: 'error', message: input.error });
      return;
    }

    const request = new AbortController();
    pending.current = request;
    setState({ kind: 'loading' });

    const result = await explainAvailability(input.context, mockAdapter, request.signal);
    if (!request.signal.aborted) setState({ kind: 'result', result });
    if (pending.current === request) pending.current = null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={explain}
        aria-disabled={state.kind === 'loading'}
        className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50 aria-disabled:opacity-60"
      >
        Explain Availability
      </button>
      <div aria-live="polite" aria-atomic="true" data-testid="availability-explanation">
        {state.kind === 'loading' && <p className="mt-2 text-sm text-slate-600">Preparing explanation…</p>}
        {state.kind === 'error' && <p className="mt-2 text-sm text-rose-700">{state.message}</p>}
        {state.kind === 'result' && (
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">
              {state.result.source === 'mock' ? 'Mock explanation' : 'Fallback explanation'}
            </p>
            <p>{state.result.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
