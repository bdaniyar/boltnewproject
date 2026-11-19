import { explanationText } from './context';
import type { ExplanationContext } from './context';

export type ExplanationAdapter = (
  context: ExplanationContext,
  signal: AbortSignal,
) => Promise<unknown>;

export type Explanation = {
  explanation: string;
  source: 'mock' | 'fallback';
};

export const EXPLANATION_TIMEOUT_MS = 1500;
const MAX_EXPLANATION_LENGTH = 180;

function validateOutput(output: unknown, expected: string): string | undefined {
  if (typeof output !== 'object' || output === null || Array.isArray(output)) return;
  const keys = Reflect.ownKeys(output);
  if (keys.length !== 1 || keys[0] !== 'explanation') return;

  const { explanation } = output as { explanation: unknown };
  if (typeof explanation !== 'string' || explanation.length > MAX_EXPLANATION_LENGTH) return;
  if (explanation.trim() === expected) return expected;
}

export async function explainAvailability(
  context: ExplanationContext,
  adapter: ExplanationAdapter | undefined,
  signal: AbortSignal,
): Promise<Explanation> {
  const expected = explanationText[context.reasonCode];
  const fallback: Explanation = { explanation: expected, source: 'fallback' };
  if (!adapter || signal.aborted) return fallback;

  const request = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let stopRequest: () => void = () => {};
  const stop = new Promise<undefined>((resolve) => {
    stopRequest = () => {
      request.abort();
      resolve(undefined);
    };
    timeout = setTimeout(stopRequest, EXPLANATION_TIMEOUT_MS);
    signal.addEventListener('abort', stopRequest, { once: true });
  });

  try {
    const output = await Promise.race([adapter(context, request.signal), stop]);
    const explanation = validateOutput(output, expected);
    return explanation ? { explanation, source: 'mock' } : fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', stopRequest);
  }
}
