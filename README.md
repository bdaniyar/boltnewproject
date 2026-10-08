# Smart Campus Room Availability Checker

A one-page React and TypeScript demo with fictional rooms and bookings. It only checks availability; it does not save or confirm bookings. The editable current time is a supplied demo clock, initially 10:00, not the real device clock.

## Run

```sh
npm ci
npm run dev
```

## Verify

```sh
npm test
npm run build
npm run typecheck
npm run lint
```

With the development server running at http://127.0.0.1:5173 and Google Chrome installed:

```sh
npm run test:browser
```

Logic tests transpile the real bookingLogic.ts with the existing TypeScript dependency and run it using Node's test runner. Browser checks use Playwright with installed Chrome. No application logic is replaced in tests.

The parent directory contains the Word report in reports/ and original snapshot, prompts, logs, and real final screenshots in evidence/. The immutable v1 archive was created before application changes. To inspect it, extract into a separate directory; do not overwrite the final project.

Blocked rooms use the more specific “Blocked” label and cannot be selected. Invalid booking times show “Unavailable” with reasons. The schedule scrolls horizontally inside its panel.
