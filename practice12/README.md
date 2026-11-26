# Practice 12 – Smart Campus Availability

The React duration checker and the Appsmith Community app implement the same frozen [requirements](Shared_Requirements.md) and [test inputs](fixtures.json). The [eight-case CSV](Test_Cases.csv), [comparison](Comparison_Matrix.md), [security checklist](Security_Checklist.md), and [effort record](Engineering_Effort.md) point to original logs and screenshots.

## Code reproduction

1. Use Node.js 22 and Chrome. From this worktree, run `npm ci` and `npm run dev -- --host 127.0.0.1 --port 5191 --strictPort`.
2. Open [the duration checker](http://127.0.0.1:5191/?practice=12). The original entry page has a footer link to the same view.
3. Run `node practice12/tools/check-ui.mjs code 'http://127.0.0.1:5191/?practice=12' /tmp/practice12-code-check` for the eight cases, nine validation and safe-input checks, and the narrow-screen check.
4. Run `npm test`, `npm run test:legacy`, `npm run typecheck`, `npm run lint` and `npm run build`. Existing booking and Explain Availability browser outputs are in [baseline](evidence/baseline/) and [final](evidence/code/). Archived browser checks 06–08 ran with only the loopback port and, where needed, evidence destination redirected in temporary copies.

Base commit `ab2ccb4103ef3b9c9b800994616cb99db881f0be` is the Practice 11 branch tip. The latest remote main at the time of checking was `768cba499d6a073aed54d63b7da7636c99b9d853`. It contains the Practice 11 merge and matches the checkpoint for app source, tests, lockfile, README, and CI. Its Bolt sync removed 210 earlier binary files, so the Practice 12 worktree starts at the Practice 11 tip to preserve that evidence. The original checkout and branch were left available.

The new view calls [the adapter](../src/practice12Availability.ts), then reuses `validateBooking` from the original engine. See [the source patch](evidence/code/source.patch). All five fictional rooms and bookings, the original booking view and the mock Explain Availability feature remain available through the original route.

## Appsmith reproduction

See [Appsmith setup and import](low-code/README.md). The app was built in the genuine Appsmith Community editor on loopback after the authenticated Chrome automation host failed to start. The exported JSON was imported into a separate workspace and tested again. The low-code URL is an authenticated local editor with a Preview control.

## Submission and integration

The verified [published Bolt demo](https://smart-campus-room-ch-86qg.bolt.host/) currently serves the earlier checker. It returned HTTP 200 and showed A-102 available for 11:00–12:00. The public site did not show the Practice 12 duration view or the Practice 11 Explain button during verification. The [existing GitHub source repository](https://github.com/bdaniyar/boltnewproject) is public. The Practice 12 branch is local.

With owner approval, review the Practice 12 diff, remove any student ID, personal contact or account details from files planned for public sharing, and inspect the staged commit for secrets. Integrate the reviewed Practice 12 commit on a feature branch based on the current remote main. Review the 210 removed historical binary files separately before deciding whether to restore them. Use the existing GitHub CI and rerun the Practice 12 browser checks. Sync or import the approved source into the existing newer Bolt project, test in preview, then publish and verify the duration route and Explain Availability. If an external Appsmith demo is needed, import the JSON into a separate Appsmith Cloud app, verify sharing and preview, then publish with owner approval.
