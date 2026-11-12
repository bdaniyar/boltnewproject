# Dependency and privacy evidence before mitigation

The fresh `npm audit --json` returned exit 1 and reported 25 affected packages: two low, seven moderate, fourteen high and two critical. Counts refer to affected packages in npm's summary, not 25 independently exploited application vulnerabilities. `npm audit --omit=dev --json` reported one high affected package, ws 8.18.3, reached through the unused Supabase dependency. No source import of Supabase was found in `src/`; this does not erase the lockfile finding.

Installed paths are saved in `evidence/verification/installed-dependencies.json` and `ws-path.json`. Raw full and production-only audit responses, exact commands and exit metadata are preserved.

The Vite maintainer advisory GHSA-vg6x-rcgg-rjx6 covers Vite 5.4.8 and describes unsafe development-server cross-origin behavior, including loopback use. A benign GET for this task's fictional `src/sampleData.ts` with a synthetic Origin returned HTTP 200 and `Access-Control-Allow-Origin: *`. This confirms the observed HTTP setting. No credential file was requested and no browser attack was performed.

Primary source: https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6

The Vitest maintainer advisory GHSA-5xrq-8626-4rwp concerns privileged UI/API server modes and describes specific exposure conditions. The verified project commands use `vitest run`, not a network-exposed UI/API server. An affected installed version is confirmed; exploitation in this command configuration is not established. The registry and maintainer page show different patched-range details, so the raw audit is retained instead of claiming a guessed safe version.

Primary source: https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp

These findings concern installed tooling and dependency paths. They do not demonstrate a vulnerability in the remote static demo or prove compromise. The provided live URL responded correctly, but its deployed revision is not established as the local baseline. No new deployment is requested.

A limited scan of 304 tracked text files found no matches for sampled private-key/token patterns and no tracked `.env*` files. The application source had no observed raw-HTML insertion sink. A synthetic script string passed through the actual BookingPanel render was escaped. This is bounded evidence, not a complete secret or penetration audit.

R3 remains owned by Boranov Daniyar. A compatible toolchain/dependency update needs a separate reviewed patch and full regression verification. Until then, restrict development-tool browsing to trusted project pages, avoid privileged Vitest server modes and credentials, and do not expose dev servers. Loopback binding alone is insufficient for the cited Vite issue. Proposal 01 records advisories but does not claim to fix these versions.
