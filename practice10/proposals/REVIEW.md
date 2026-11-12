# Two proposed mitigations awaiting one approval

The original source baseline is commit `2857ed197bbc05296c6731fb458fa20a550913e8`. Only Practice10 evidence and proposal files were created in the working repository. Application source, tests, configuration, root README and root AGENTS.md remain unchanged. The existing user deletion of the Practice09 ZIP is preserved.

## Proposal 01 — repeatable verification

Risk R1 is confirmed by a missing tracked CI workflow and a real exit-1 failure of the documented browser rerun command. A new workflow runs the current tests, typecheck, lint, build and real browser checks, while preserving their evidence. The browser script gains one optional output path; its default behavior and overwrite refusal remain. README gives the new command. Actions are pinned to repository ref values read during this audit; checkout does not persist credentials and permissions are limited to contents:read. There is no deploy or merge job.

Exact diff: `01-repeatable-verification.patch`.

Regression risks: an incorrect output path could target historical evidence; preserve the existing refusal to overwrite. A browser dependency or hosted runner assumption may fail in cloud execution; the workflow needs a first real GitHub run after an authorized push. No successful cloud execution is claimed by a YAML parse. The audit step records known advisories for review and is not a security clearance.

After approval, verify the custom fresh output path and the refusal to overwrite it, compare source/assertion preservation, run all existing tests/browser checks and typecheck/lint/build. Inspect workflow YAML and shell syntax. Record local results separately from an unperformed hosted CI run.

## Proposal 02 — explicit agent boundaries

Risk R2 is confirmed by the missing secret, isolation and merge/acceptance rules in the original AGENTS.md. A short section adds a one-room exercise interpretation, separate worktree/branch and port rules, credential boundaries, allowed verification scope, evidence requirements and human review. It retains the existing AC contract, pure functions and five-room UI.

Exact diff: `02-agent-boundaries.patch`.

Regression risks: overly broad rules could block valid project work. The proposed rules allow the documented verification commands and task-approved changes, and distinguish worktree isolation from a real security sandbox. Acceptance, merging and deployment remain separate decisions.

After approval, compare the complete before/after playbook and check the acceptance criteria and commands remain accurate. Use the same full regression run to demonstrate no application change. Documentation reduces operational ambiguity; it does not enforce access control or automatically secure a dependency.

Both proposed patches passed `git apply --check` without being applied. The proposed workflow parsed as YAML with twelve steps and contents:read permission. Proposed residual scores are not recorded as achieved results. Actual residual scores and the final release decision follow application and verification after approval.
