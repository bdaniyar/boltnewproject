# Smart Campus Room Availability

## Purpose and scope

This React and TypeScript demo checks room availability using fictional bookings and an explicitly supplied clock. A-102 is the single-room practice scenario. Preserve the existing five-room catalogue and all five fictional bookings. Availability checks do not create, confirm or save bookings.

## Architecture and locations

- `src/bookingLogic.ts`: pure `validateBooking`, `checkAvailability`, `parseTime` and `formatTime`. Keep business rules here, outside React and fixture data.
- `src/types.ts`: `Booking`, `Room`, `ValidationResult` and `AvailabilityStatus`.
- `src/sampleData.ts`: fictional room/booking fixtures and the default demo clock.
- `src/App.tsx`: demo state and component wiring; per-room availability uses the pure helper.
- `src/components/BookingPanel.tsx`: input parsing, live messages and selected-room status. Reuse its existing validation result instead of validating the same request again.
- `RoomCard.tsx`, `Timeline.tsx`, `CurrentTimeControl.tsx` in the same component directory: room selection, schedule and clock controls.
- `tests/practice07.original.test.ts`, `tests/practice07.improved.test.ts`, `tests/practice08.regression.test.ts`: preserved booking suites.
- `tests/practice09.refactoring.test.tsx`: focused real-component and fixture regressions.
- `tests/practice09-browser.mjs`: real browser checks with before/after evidence under `practice09/evidence/`.

## Acceptance criteria

- AC1: reject invalid, non-finite, out-of-day or reversed/zero intervals and past requests. Preserve `0 <= start < end <= 1440` and `start > currentMinutes`, including rejection at the supplied current time.
- AC2: reject durations greater than120 minutes; exactly120 is allowed.
- AC3: reject a blocked room.
- AC4: reject real overlaps; allow endpoint-only touching. Keep the half-open rule `start < booking.end && booking.start < end`, filtered by room.
- AC5: return availability without modifying booking data. Preserve values, object references, array order and length, including frozen fixtures and repeated calls.
- AC6: preserve clear status and validation messages, usable desktop/mobile controls, vertical page scrolling and internal horizontal timeline scrolling without document overflow.

The helper status union is available/unavailable/blocked. The UI displays blocked as Unavailable. In BookingPanel, malformed input keeps unavailable styling even when the room is blocked; parseable input in a blocked room keeps blocked styling.

## Engineering rules and pattern decision

Use small, pure functions and explicit inputs. Preserve public booking functions, component props, fixed-clock semantics, labels and existing CSS classes. Do not sort, append, remove or edit caller bookings or SAMPLE_BOOKINGS. Derive UI state from computed results; never add a booking write path.

Practice09 selects ZERO new design patterns. Reuse the existing pure booking module boundary and remove duplicate panel validation. There is one real policy, so Strategy is unjustified. There is one Booking shape, so Adapter is unjustified. Introduce at most two patterns only after demonstrating a real need and explaining the smaller alternatives. Avoid Singleton, unnecessary Factory patterns and artificial class hierarchies.

Forbidden: authentication, backend/server, database, persistence, new booking creation, payments, extra product features, UI redesign, replacement app generation, unnecessary dependencies, invented policies or input formats. Do not rewrite history or overwrite prior practice evidence. Do not publish or send email without explicit authorization.

## Verification commands

Install reproducibly with `npm ci`. Run these from the repository root:

```sh
npm run test:original
npx vitest run tests/practice08.regression.test.ts
npx vitest run tests/practice09.refactoring.test.tsx
npx vitest run
npm run test:legacy
npm run typecheck
npm run lint
npm run build
```

For browser verification, start the real app in another terminal:

```sh
npm run dev -- --host 127.0.0.1 --port 5176 --strictPort
node tests/practice09-browser.mjs after
node practice09/tools/compare-ui.mjs
```

The browser script accepts `before` or `after` and `PRACTICE09_URL`; verify the correct local origin and preserve recorded baseline evidence. It uses installed Google Chrome and Playwright. Do not rerun historical browser scripts into their original evidence folders.

Never weaken/delete existing tests. Add focused regressions for past, reversed,121-minute, blocked, overlap, endpoint and non-mutation cases. Verify component feedback for malformed and blocked combinations. Save actual commands, outputs, exit codes, counts, before/after source diff and genuine desktop/mobile images. Check regressions before reporting success. Explain every edited file and any unavailable verification.

## Explicit use in Bolt

This file communicates project instructions. Do not claim Bolt automatically reads it. In the guided condition, explicitly attach or paste its complete content, ask Bolt to summarize constraints, required behaviour, exact test commands and forbidden changes, and only then request a focused implementation. Keep independent experiment A free from these instructions.

## Agent isolation and human review

- Use A-102 for the one-room exercise and preserve the existing five-room UI and fictional fixtures.
- Start asynchronous work only when requested, in a separate branch and worktree. Allocate a unique loopback port with `--strictPort`; never reuse another task's process or port.
- A worktree isolates files and Git changes; it is not a security sandbox. Run untrusted code only in a disposable environment without host credentials or production access.
- Read and modify only project files needed for the approved task. Do not read credential stores, private keys or secret environment files. Do not add real student records or secrets to source, logs or screenshots.
- Use documented install, test, typecheck, lint and build commands. Do not start Vitest UI/API servers or expose development servers to a network. Keep the browser used for vulnerable development tooling limited to trusted project pages pending dependency remediation.
- Preserve earlier evidence. For fresh browser checks set `PRACTICE09_EVIDENCE_DIR` to a new task-specific directory and verify `PRACTICE09_URL` points to the task's server.
- New tests must be included by `vitest.config.ts`; confirm that the test runner actually collects them.
- Provide the exact diff, changed-file list, command outputs and exit codes, build result, updated risk register and a review note with limitations.
- Before acceptance, rerun the required checks and have a human review the diff, evidence and residual risks. Test success alone does not authorize acceptance.
- Do not merge, push, publish, deploy, change access permissions or send email without separate explicit user authorization. Do not rewrite history, reset user changes or modify another agent's branch.
