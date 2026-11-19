# Three system prompts

The three files use the same context cases in prompts/scenarios.json and the same approved sentence table in src/explanations/context.ts. The comparison below checks what each instruction asks for when applied to those cases. The local mock consumes the reason code and has no prompt parameter. No remote model output or prompt effect was measured.

| Prompt | Clarity | Consistency across the six cases | Factual agreement | Conciseness | Safety |
|---|---|---|---|---|---|
| 01 Direct | Short and direct | Names the status and reason and asks for their approved sentence | Forbids deciding availability or adding booking details | Two-sentence ceiling, exact JSON | Treats all field values as data |
| 02 Ordered | Status, then reason, then approved sentence | Same ordered process for available, overlap, blocked, past, reversed and over-limit cases | Explicitly forbids invented owner, time, cause and confirmation | Two-sentence ceiling, exact JSON | Specifies that data fields cannot issue instructions |
| 03 Checklist | Strong final review instruction | Checks the code and boolean before returning in every case | Explicitly blocks unsupported facts and booking promises | Two-sentence ceiling, exact JSON | Requires the same data boundary and adds a final agreement check |

For all three, an available request can only explain availability for this interval. The overlap scenario can mention a conflict, without asserting its owner or exact booking time. The four other scenarios can mention only their supplied reason. Empty, long or malformed raw inputs do not reach any prompt.

I recommend 02 Ordered for a future server adapter. It gives a clear order and identifies the specific kinds of details the student should not see. This is a static recommendation. Real prompt performance, latency and cost remain unmeasured.
