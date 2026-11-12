# Dependency audit inventory

Before and after: 25 affected packages (2 low, 7 moderate, 14 high, 2 critical). This is npm’s package summary, not 25 proven exploits. No versions or dependencies were changed. Production-only audit identifies ws through the unused Supabase dependency; no source import of Supabase was found. Full raw audit records and exit codes are included.

| Package | Installed | Severity | Direct |
|---|---|---|---|
| @babel/core | 7.25.7 | low | False |
| @babel/helpers | 7.25.7 | moderate | False |
| @eslint/plugin-kit | 0.2.0 | low | False |
| @humanfs/node | 0.16.5 | moderate | False |
| @vitest/mocker | 2.1.9 | moderate | False |
| ajv | 6.12.6 | moderate | False |
| brace-expansion | 1.1.11, 2.0.1 | high | False |
| browserslist | 4.24.0 | high | False |
| cross-spawn | 7.0.3 | high | False |
| esbuild | 0.21.5 | moderate | False |
| flatted | 3.3.1 | high | False |
| glob | 10.4.5 | high | False |
| js-yaml | 4.1.0 | high | False |
| minimatch | 3.1.2, 9.0.5 | high | False |
| nanoid | 3.3.7 | high | False |
| picomatch | 2.3.1 | high | False |
| postcss | 8.4.47 | high | True |
| postcss-selector-parser | 6.1.2 | moderate | False |
| rollup | 4.24.0 | high | False |
| source-map-js | 1.2.1 | high | False |
| tinypool | 1.1.1 | critical | False |
| vite | 5.4.8 | high | True |
| vitest | 2.1.9 | critical | True |
| ws | 8.18.3 | high | False |
| yaml | 2.5.1 | moderate | False |

The CSV includes affected ranges and advisory URLs. See security-assessment.md for exposure conditions and uncertainty.
