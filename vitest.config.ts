import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/practice07.original.test.ts',
      'tests/practice07.improved.test.ts',
      'tests/practice08.regression.test.ts',
      'tests/practice09.refactoring.test.tsx',
      'tests/practice11.explanation.test.ts',
    ],
  },
}));
