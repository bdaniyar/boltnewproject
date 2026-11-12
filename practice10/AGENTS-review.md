# Task 06 review of the agent playbook

## Actual review request

Review AGENTS.md and project documentation only. Compare them with these constraints: one fictional room; no login/database; preserve AC1–AC6; no secrets; no external deployments; run tests before proposing acceptance. Report missing or conflicting rules. Draft a minimal patch to AGENTS.md, but wait for my approval before applying it.

## Actual response

The original AGENTS.md already describes the app's architecture, fictional fixtures, AC1–AC6, pure functions, responsive feedback and exact test commands. It prohibits login, database, persistence and product expansion. It also prohibits publishing and email without explicit authorization. These are useful existing controls and should stay.

The single-room exercise is explicitly A-102. The project has five existing fictional rooms and five bookings. This is a documented exercise scenario within the preserved multi-room UI, so reducing the application to one room would be an unnecessary destructive scope change. The proposed addition makes that interpretation explicit.

Missing operational rules are: no secrets or credential-store access; no real student records in the application; a separate branch/worktree for asynchronous work; a unique loopback port; a distinction between a worktree and a security sandbox; and explicit human review before acceptance or merge. Running tests is already required, but test success is not currently distinguished from permission to accept changes. The rule against unauthorized deployment exists and is reinforced rather than replaced.

The old browser command cannot make fresh evidence when its saved result already exists. The proposed playbook names the new evidence-directory option from Proposal 01. It also calls out the current Vitest filename allowlist so a new test must be demonstrably collected.

The generic `.bolt/prompt` asks for fully featured production designs. For this practice, the user's explicit fictional-demo scope and repository-specific instructions govern the task. No production service, authentication or extra UI should be generated from that generic text.

The exact proposed patch is `proposals/02-agent-boundaries.patch`; the original is `evidence/baseline/AGENTS.before.md` and the proposed result is `proposals/after/AGENTS.md`. These are review artifacts. The root file has not been changed. Approval is required by the user's Task 06 and Task 08 instructions before applying either mitigation.
