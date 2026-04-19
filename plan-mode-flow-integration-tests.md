# Plan #mode-flow-integration-tests

Goal: Cover end-to-end mode lifecycle branches with integration tests.

## Commits
1. `test: add mode select to start run integration test`
- Validate selection drives run context creation.

2. `test: add game-over to mode select integration test`
- Validate post-run routing behavior.

3. `test: add replay same mode integration branch`
- Verify replay keeps mode and setup expectations.

4. `test: add sandbox setup integration branch`
- Validate setup payload usage and reset behavior.

5. `test: harden async event timing in integration tests`
- Stabilize RAF/event timing with deterministic helpers.
