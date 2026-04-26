# Plan #mode-flow-integration-tests

Goal: Cover end-to-end mode lifecycle branches with integration tests.

## Implementation Steps

### 1. `test: add bootstrap mode-select start integration`
- Add integration test that mounts `blocks-4-gina` and simulates mode card selection.
- Assert non-sandbox mode selection starts a run with `runSource: 'modeSelect'`.

### 2. `test: add sandbox setup mode flow integration`
- Assert selecting sandbox routes to `sandboxSetup` UI state first.
- Assert sandbox setup payload feeds game settings and starts run with `runSource: 'sandboxSetup'`.

### 3. `test: add resume/replay mode flow integration`
- Assert resume button starts run with `skipSessionRestore: false` and `runSource: 'resume'`.
- Assert saved mode id is reused when resuming.

### 4. `test: add mode-select reentry refresh integration`
- Assert mode-select-shown callback refreshes resume visibility from session storage state.

### 5. `test: keep integration deterministic`
- Use focused module mocks at bootstrap seam (`HTMLInterface`, `SessionStorage`, `GameRunner`) so no RAF/event-loop flakes.

## Notes
- These tests validate lifecycle wiring in bootstrap without duplicating lower-level coordinator unit tests.
