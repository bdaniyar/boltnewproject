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

The default Vitest command runs the improved 43-test suite. The preserved original suite has 17 tests and uses a separate config. Nine pre-existing Node tests remain available through `test:legacy`. All suites import or transpile the real `src/bookingLogic.ts`; no booking implementation is substituted. Availability and validation now share the same rules, including finite numeric inputs.

With the real development server at http://127.0.0.1:5173 and installed Google Chrome:

```sh
node tests/practice07-browser.mjs
```

This runs 12 actual browser assertions, including desktop/mobile controls, required-input feedback, room blocking, integration with the real helper, and preservation of all five fictional booking records. The prior Practice 06 browser script remains available through `npm run test:browser`.

## Assignment artifacts

The sibling `Practice07_Boranov_Daniyar/` directory contains the Practice 07 DOCX/PDF report, test copies, real screenshot/output evidence, review decisions, mutation log, an unsent email draft, and reproduction instructions. Its baseline archive plus final source patch reconstruct the exact tested project. Prior Practice 06 artifacts in the parent `evidence/` and `reports/` directories are preserved.

The timeline scrolls horizontally within its own panel. The mobile page scrolls vertically. There is no database, authentication or persistent booking storage. Blocked cards remain disabled, while the currently selected room can be unblocked using its panel checkbox.
