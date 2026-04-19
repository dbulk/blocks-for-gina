# Plan #mode-context-plumbing

Goal: Carry mode and run context through all core lifecycle points.

## Commits
1. `refactor: define run context contract`
- Add typed run context (modeId, setup, source).

2. `refactor: pass run context through coordinator start`
- Replace scattered mode reads with explicit context object.

3. `feat: include mode context in game-start and game-end events`
- Extend event payloads to include mode metadata.

4. `refactor: consume context in summary and persistence`
- Use one source of truth for mode-aware behavior.

5. `test: add run context propagation tests`
- Validate mode/context consistency through lifecycle.
