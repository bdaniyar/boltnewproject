"""Write review copies and diffs only; never apply them to the repository."""
from pathlib import Path
import difflib, hashlib, json
repo=Path(__file__).resolve().parents[2]
base=repo/'practice10'
proposed=base/'proposals/after'
workflow='''name: Verify Smart Campus

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          persist-credentials: false
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run test:legacy
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps chrome
      - name: Check desktop and mobile feedback
        env:
          PRACTICE09_URL: http://127.0.0.1:5180
          PRACTICE09_EVIDENCE_DIR: ${{ runner.temp }}/smartcampus-ui
        run: |
          npm run dev -- --host 127.0.0.1 --port 5180 --strictPort > "$RUNNER_TEMP/vite.log" 2>&1 &
          server_pid=$!
          trap 'kill "$server_pid" 2>/dev/null || true' EXIT
          for attempt in {1..30}; do
            kill -0 "$server_pid" || exit 1
            if curl --fail --silent http://127.0.0.1:5180/ > /dev/null; then break; fi
            sleep 1
          done
          curl --fail --silent http://127.0.0.1:5180/ > /dev/null
          node tests/practice09-browser.mjs after
      - name: Record dependency advisories for review
        if: always()
        run: |
          audit_status=0
          npm audit --json > "$RUNNER_TEMP/npm-audit.json" || audit_status=$?
          if [ "$audit_status" -gt 1 ]; then exit "$audit_status"; fi
          # Exit 1 records known findings; it is not a security clearance.
      - name: Preserve browser and advisory evidence
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: verification-evidence
          retention-days: 14
          path: |
            ${{ runner.temp }}/smartcampus-ui
            ${{ runner.temp }}/vite.log
            ${{ runner.temp }}/npm-audit.json
'''
browser=(repo/'tests/practice09-browser.mjs').read_text()
old='const submission = path.resolve(project, `practice09/evidence/ui-${phase}`);'
new='''const submission = path.resolve(project,
  process.env.PRACTICE09_EVIDENCE_DIR || `practice09/evidence/ui-${phase}`);'''
assert browser.count(old)==1
readme=(repo/'README.md').read_text()
readme+='''
## Practice 10 verification

Use a new evidence directory for each browser run to preserve earlier results:

```sh
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
# In another terminal:
PRACTICE09_URL=http://127.0.0.1:5180 PRACTICE09_EVIDENCE_DIR=practice10/evidence/ui-after node tests/practice09-browser.mjs after
```

The GitHub verification workflow runs the existing tests, typecheck, lint, build and desktop/mobile checks on an isolated runner. It records dependency advisories for human review. Passing CI does not authorize merging or deployment; the owner must review the diff, evidence and unresolved risks.
'''
agents=(repo/'AGENTS.md').read_text()
agents+='''
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
'''
groups={'01-repeatable-verification.patch':{'.github/workflows/verify.yml':workflow,'tests/practice09-browser.mjs':browser.replace(old,new),'README.md':readme},'02-agent-boundaries.patch':{'AGENTS.md':agents}}
manifest=[]
for name,files in groups.items():
 diff=''
 for rel,after in files.items():
  source=repo/rel
  before=source.read_text() if source.exists() else ''
  target=proposed/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(after)
  diff+='diff --git a/'+rel+' b/'+rel+'\n'
  if not source.exists(): diff+='new file mode 100644\n'
  diff+=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+rel if source.exists() else '/dev/null',tofile='b/'+rel))
 path=base/'proposals'/name;path.write_text(diff)
 manifest.append({'patch':name,'files':list(files),'sha256':hashlib.sha256(diff.encode()).hexdigest(),'applied':False})
(base/'proposals/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
