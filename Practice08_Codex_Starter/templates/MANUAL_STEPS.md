# What the student must still do (and Codex should prepare for)

1. Instructor's slide 14 explicitly says manually create `bug-detector/SKILL.md` with editor/Notepad, although this starter provides exact prewritten content for convenience. To comply, the student must personally retype/recreate and save the final file. Do not claim AI wrote it by hand.
2. After actual BUG-A/BUG-B tests exist, freeze comparison input. Open separate independent chats: A without Skill; B with Skill activated (or labeled prompt-only simulation). Use exactly identical shared code/AC/tests/output/question. Save unedited responses and real screenshots. Ensure Skill cannot auto-trigger session A; metadata here has `allow_implicit_invocation: false`.
3. For Codex IDE, a repo skill may live in `.agents/skills/bug-detector/SKILL.md` (OpenAI documentation); the assignment's `bug-detector/` folder and ZIP should still be preserved separately. Invoke explicitly with `$bug-detector` only in condition B. Do not confuse Codex local registration with proof of installing into ChatGPT or Claude.
4. Take real installation/activation screen capture, or state clearly why Skills were unavailable and that a prompt-only simulation was used. Include actual ZIP tree screenshot.
5. Edit Word report to insert correct published live-demo URL and missing real screenshots.
6. Review actual report, attachments, AI model label and email subject. Slide 29 says Practice #09 for email subject despite Lesson #08 / Practice Work #08.
7. Email at the end of class only after materials are accurate. Do not automatically email from Codex.

Optional according to slides: a second `regression-tester` Skill and an MCP extension. Neither is required.
