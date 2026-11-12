# Background agent safety scenario

This is a theoretical workflow. No asynchronous remote coding agent is claimed to have run. The audit's isolated local worktree is an actual baseline test environment, not proof of a remote agent execution.

An owner first approves a narrow task and starts a branch/worktree such as `git worktree add -b audit/approved-risk-fix ../smartcampus-approved-risk-fix <reviewed-baseline-commit>`. A branch separates the proposed history; a worktree separates files and dependency installations. Neither prevents host credential access, so an agent executing untrusted code also needs a disposable container or VM with no mounted credentials or production access.

The agent may read the approved project source, tests, package scripts, lockfile, README, AGENTS.md and risk register. It may modify only the approved paths. Application fixtures stay fictional. It may not inspect credential stores, private keys or secret environment files, use real student records, contact production services, change permissions, publish, send email, merge, push or rewrite another branch without separate authorization.

Permitted verification commands are `npm ci`, `npm test`, `npm run test:legacy`, `npm run typecheck`, `npm run lint` and `npm run build`. A focused existing suite may be run for the approved change. Browser checks use a unique loopback port with `--strictPort` and a new task evidence directory; the agent must verify that the process and URL belong to its own worktree. No shared database exists in this project. A task must never stop another task's server to free a port.

Each parallel task has its own branch, worktree, port, output directory and dependency installation. Agents may read shared reference documents, but they must not concurrently edit a shared file. The owner reviews overlapping proposals sequentially, resolves conflicts on a review branch, and reruns tests against the combined source before acceptance.

Required output from the agent is the exact source diff, changed-file list, test output and exit codes, build result, updated risk register, a review note and remaining limitations. Evidence must identify its baseline and tested source. A passing unit suite alone does not authorize a merge.

Before merging, a human checks the diff's scope, fixture and AC preservation, actual test collection, security findings, unresolved risks and source identity. CI and browser checks must pass on the combined change. Deployment needs a separate explicit approval and a verified deployed revision; an existing public URL is not proof that the new source was deployed.
