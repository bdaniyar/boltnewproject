# Smart Campus Room Availability Checker

An existing React and TypeScript demo with fictional rooms and bookings. It checks availability without saving or confirming bookings. The editable current time is a supplied demo clock, initially 10:00, rather than the device clock. The original room cards, layout, styling and five-room sample catalog are retained.

## Run

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Select A-102 for the Practice 07 single-room scenarios. It has the existing 10:00–11:00 fictional booking. Set the clock to 09:00 and enter 11:00–12:00 to see Available. The selected-room demo checkbox can block or unblock that room in memory; refreshing resets the demo state.

## Verify

```sh
npx vitest run
npm run test:original
npm run test:legacy
npm run typecheck
npm run lint
npm run build
```

The default Vitest command runs 81 tests: the preserved original 17, improved 43, six Practice 08 regressions, and 15 Practice 09 component regressions. The original suite can still run separately through `test:original`. Nine pre-existing Node tests remain available through `test:legacy`. Booking suites import or transpile the real `src/bookingLogic.ts`; the new component suite renders the real `BookingPanel`. Availability and validation share the same rules, including finite numeric inputs.

With the real development server at http://127.0.0.1:5173 and installed Google Chrome:

```sh
node tests/practice07-browser.mjs
```

This runs 12 actual browser assertions, including desktop/mobile controls, required-input feedback, room blocking, integration with the real helper, and preservation of all five fictional booking records. The prior Practice 06 browser script remains available through `npm run test:browser`.

## Assignment artifacts

The sibling `Practice07_Boranov_Daniyar/` directory contains the Practice 07 DOCX/PDF report, test copies, real screenshot/output evidence, review decisions, mutation log, an unsent email draft, and reproduction instructions. Its baseline archive plus final source patch reconstruct the exact tested project. Prior Practice 06 artifacts in the parent `evidence/` and `reports/` directories are preserved.

The timeline scrolls horizontally within its own panel. The mobile page scrolls vertically. There is no database, authentication or persistent booking storage. Blocked cards remain disabled, while the currently selected room can be unblocked using its panel checkbox.

## Practice 08

See [practice08/README.md](practice08/README.md) for the saved baseline, separate controlled BUG-A/BUG-B reproductions, real RED/GREEN evidence, Skill comparison prompts, editable Word report, and submission package instructions. The production booking source remains identical to the correct baseline. The package marks external comparison and student manual actions as pending.

For the current Practice 08 browser checks, run the app on port 5174 and use `npm run test:browser:practice08`. The script supports a different correct local origin through `PRACTICE08_URL`.

## Practice 09

The root [AGENTS.md](AGENTS.md) describes the actual architecture, AC1–AC6, scope and verification commands. Practice 09 reuses the panel's existing validation result for its status. No new design pattern, policy, persistence or UI change is introduced.

Run the new component regressions with `npx vitest run tests/practice09.refactoring.test.tsx`. For browser evidence, start the app on port 5176 and run `node tests/practice09-browser.mjs after`. The script preserves existing evidence and refuses to overwrite it. It supports `PRACTICE09_URL` and requires installed Google Chrome. Compare fresh before/after captures with `node practice09/tools/compare-ui.mjs`.

The `practice09/` folder contains the editable report, submission package, frozen baseline, actual test/UI evidence, rationale, and explicit Bolt experiment prompts. Real Bolt comparison responses and the remote implementation demonstration were unavailable; no response or verified publication is claimed. See `practice09/UNAVAILABLE_EVIDENCE.md` for the exact remaining external evidence.
