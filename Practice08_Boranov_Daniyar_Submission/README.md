# Practice 08 submission

Student: Boranov Daniyar, 24B031718. Class: Thursday 14:00–17:00.

The editable report is `Practice08_Boranov_Daniyar_Report.docx` in the assembled submission folder. The clean project export is `SmartCampus_Source_Export.zip`. The submission folder and full ZIP are created in the current repository as `Practice08_Boranov_Daniyar_Submission/` and `Practice08_Boranov_Daniyar_Submission.zip`.

## Verified local results

- Preserved Git baseline: `afcff636e723e7549f039ef688bf58b6ed9a7656`; archive in `evidence/baseline/SmartCampus_Baseline.zip`.
- Initial `npm ci` failed because Vitest was absent from the lock. The original is preserved; synchronizing the lock restored clean installation without adding a new declared dependency.
- Before bug injection: Practice07 original 17/17, improved 43/43, legacy 9/9 passed.
- Separate baseline copies reproduced BUG-A and BUG-B. Each targeted RED run had one failure and five tests filtered out. After the documented minimal patch, each targeted case passed and its full suite passed 66/66.
- Final project: 66/66 Vitest tests; 9/9 legacy Node tests; 14/14 real Chrome checks; typecheck, lint and production build passed.
- The production `src/` tree and both Practice07 test files are unchanged. Six new regressions and the default all-suite configuration improve future coverage.
- Real screenshots are under `evidence/ui/`. Log viewer screenshots are explicitly labelled browser views of saved output, not terminal captures.

## Run the exported source

Extract `SmartCampus_Source_Export.zip` and enter its `SmartCampus/` directory. Node.js v22.22.0 and npm 10.9.4 were used for the recorded project runs. The code uses Vitest 2.1.9 and Vite 5.4.8.

```sh
npm ci
npx vitest run
npm run test:legacy
npm run typecheck
npm run lint
npm run build
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

With that server running and installed Google Chrome, use `npm run test:browser:practice08`. The browser script defaults to `http://127.0.0.1:5174`; set `PRACTICE08_URL` to another correct local app origin if needed. The recorded run used Chrome 156.0.8078.48, desktop1440×900 and mobile375×812. The helper asserts against the actual served module and the real controls.

## Repeat controlled cases without changing the app

The source export includes `practice08/tools/controlled_experiments.py`. It accepts `--baseline /absolute/path/to/submission/evidence/baseline/SmartCampus_Baseline.zip` and `--evidence-root /new/output`. Run the `red bug-a` stage, inspect the failure, write the diagnosis and proposed minimal patch to the selected `bug-a/diagnosis-before-patch.md`, then run `repair bug-a` with the same options. Repeat for `bug-b`. Each case extracts a fresh baseline and shares installed dependencies by symlink. No Git checkout or reset is needed. Do not overwrite the original evidence or frozen comparison input when experimenting.

## Academic items still pending

See `PENDING_MANUAL_STEPS.md`. The student must manually recreate SKILL.md, complete two independent no-Skill/with-Skill chats using the frozen input, save real responses and screenshots, and fill the published URL and verified model/version. The comparison table remains pending. No ChatGPT/Claude Skill installation, external comparison, publication or email delivery is claimed.

## Package contents

The submission contains the Word report, SKILL.md, bug-detector.zip, source export, real evidence, frozen prompts, defect log, pending checklist and unsent email draft. `SHA256SUMS.txt` records file integrity. `tools/assemble_submission.py` can refresh the package after manual edits; do not overwrite a manually edited Word report with the generated source copy. Follow the tool's documented report source or copy the edited report back to `practice08/reports/` first.

The source archive excludes node_modules, .git, dist, .env files, caches and document-rendering QA. No PDF is a report deliverable. Word rendering images are internal QA files only.
