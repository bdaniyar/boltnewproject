import { explanationText } from './context';
import type { ExplanationAdapter } from './service';

export const mockAdapter: ExplanationAdapter = (context, signal) =>
  new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(new Error('Explanation request stopped.'));
    };

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve({ explanation: explanationText[context.reasonCode] });
    }, 100);

    if (signal.aborted) cancel();
    else signal.addEventListener('abort', cancel, { once: true });
  });
