# Plan #event-sequence-tests

Goal: Lock coordinator lifecycle event ordering and payloads.

## Commits
1. `test: add lifecycle event order harness`
- Create helper to capture emitted event sequence.

2. `test: assert select->start->score->end ordering`
- Validate canonical event progression.

3. `test: assert sandbox and arcade branch ordering`
- Validate branch-specific sequence differences.

4. `test: assert payload shape snapshots`
- Guard payload contracts for key events.

5. `refactor: remove flaky timing assumptions`
- Stabilize tests around animation ticks.
