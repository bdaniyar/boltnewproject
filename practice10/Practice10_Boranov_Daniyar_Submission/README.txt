Software Engineering Practice Work 10

The editable Word report contains the essential register, audit, mitigation evidence, test results and release decision. Supporting items are individual files and folders; no ZIP/RAR or OneDrive link is used. The email draft remains unsent.

Source/ is the tested application plus the two approved changes, without dependencies, caches or Git internals. Copy it to a separate working directory before installing. Run npm ci; npx vitest run; npm run test:legacy; npm run typecheck; npm run lint; npm run build. For browser verification start npm run dev -- --host 127.0.0.1 --port 5180 --strictPort, then run PRACTICE09_URL=http://127.0.0.1:5180 PRACTICE09_EVIDENCE_DIR=practice10/evidence/recheck node tests/practice09-browser.mjs after. Use a new output directory for each run.

Evidence contains baseline and after logs, exact command/exit metadata, original AI review and targeted diagnostics. Historical browser adapters preserve original assertions while changing only their output destinations/local origin. The recorded test collection and evidence-overwrite diagnostic failures are intentional observations, not passing application tests.

CONDITIONAL decision: known dependency advisories remain; hosted CI first execution/enforcement is not established. No push, merge or deployment was performed. The live demo was verified separately and is not claimed as the updated local build.
