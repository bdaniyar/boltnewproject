# Condition B fallback only

Use this only if actual Skill installation is unavailable. This is a prompt-only simulation, not an installed Skill. Keep condition A free from these instructions.

1. Open a fresh chat with the same model/settings as condition A.
2. Send: `This is an explicitly labelled prompt-only simulation of the bug-detector Skill. Follow the exact instructions below.` Then paste the complete `bug-detector/SKILL.md`, including its frontmatter and seven steps.
3. Paste all of `COMPARE_SHARED_INPUT.md`, unchanged. Its final diagnostic question is the same as condition A. Save the complete actual response and screenshot; record that condition B used simulation.
