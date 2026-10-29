# Fair AI comparison

**PENDING STUDENT MANUAL STEP. No external comparison responses have been collected.**

An actual Chrome access check at chatgpt.com showed an unauthenticated page and the login form. See `evidence/comparison/chatgpt-access-check.png`. No comparison prompts or credentials were entered. This is access evidence, not Skill activation evidence.

| Criterion | No Skill | With Skill |
|---|---|---|
| Correct root cause | pending actual response | pending actual response |
| Reproducible test | pending actual response | pending actual response |
| Minimal proposed patch | pending actual response | pending actual response |
| Unsupported claims | pending actual response | pending actual response |
| Clarity of explanation | pending actual response | pending actual response |

## Trial controls

Use the complete frozen `prompts/COMPARE_SHARED_INPUT.md` in both fresh chats. The file contains the same code, failing test, terminal output, AC1–AC6 and diagnostic question. Its SHA-256 is stored beside it. Copy it without changing any character. Do not rerun a later version of the code and substitute that output between trials.

- Model and settings A: [INSERT VERIFIED MODEL VERSION AND SETTINGS]
- Model and settings B: [INSERT VERIFIED MODEL VERSION AND SETTINGS]
- Skill inactive in A: [INSERT REAL EVIDENCE]
- Condition B: [INSTALLED SKILL OR EXPLICIT PROMPT ONLY SIMULATION]
- Session A response: [SAVE FULL UNEDITED RESPONSE IN evidence/comparison/no-skill-response.txt]
- Session B response: [SAVE FULL UNEDITED RESPONSE IN evidence/comparison/with-skill-response.txt]
- Session A screenshot: [INSERT REAL SCREENSHOT: No Skill chat and response]
- Session B screenshot: [INSERT REAL SCREENSHOT: With Skill chat and response]

Evaluate each response against `evidence/bug-a/` and the passing repair. Count unsupported claims explicitly, including invented test execution. A confident explanation is not proof that a test ran. The skill is not assumed to improve the answer.

## Evidence based conclusion

Pending. The controlled experiments establish the root causes and fixes; they do not measure whether the Skill improves AI answers. The local Codex diagnostic work is not a substitute for the two independent external trials.
