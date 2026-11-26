# AI-use reflection

OpenAI Codex helped read the assignment, re-use the React booking engine, configure native Appsmith widgets, build a repeatable Chrome test suite and prepare the report. Codex used the GPT-6 model family. The exact model identifier and version were unavailable.

The test outcomes came from Vitest, the Node test runner, Chrome UI actions, dependency audits and a real Appsmith JSON re-import. Appsmith rejected a generated table identifier with a space. The internal key was corrected and the visible heading stayed “Booked by.” The first Appsmith layout clipped widgets at 375 pixels. The visual canvas and table columns were adjusted and the narrow check was repeated. The authenticated Chrome automation host would not start, so the low-code comparison ran against a loopback Docker instance.

The code-based track offered direct access to the existing rule engine and small source changes. The low-code track offered fast visual controls but required checking widget bindings, platform layout and export behavior. The public Bolt page remains an earlier version, and team sharing and platform internals were outside the tests.
