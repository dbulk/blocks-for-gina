# Plan #event-sequence-tests

Goal: Lock coordinator lifecycle event ordering and payloads.

## Scope
- Add deterministic tests for coordinator lifecycle event order.
- Validate payload shape for key emitted events.
- Stabilize timing-sensitive tests around animation/game loop behavior.

## Out of Scope
- No gameplay rule changes.
- No UI redesign.
- No persistence schema changes.

## Target Files
- src/core/gamecoordinator.ts (read-only unless testability seam is required)
- src/events/eventbus.ts
- src/events/events.ts
- tests/events/eventbus.test.ts
- tests/core (new integration-style coordinator event tests)

## Commit Plan
1. `test: add coordinator event capture harness`
- Add a small reusable test helper to subscribe to event bus types and record ordered emissions.
- Keep helper isolated under tests/helpers or tests/core support file.
- Add minimal sanity test proving harness ordering and unsubscribe behavior.

2. `test: assert canonical lifecycle event ordering`
- Add integration-style test for default run flow.
- Validate ordering for mode select -> mode rules applied -> game started -> blocks popped -> game ended.
- Include at least one assertion that no duplicate terminal events fire.

3. `test: assert branch-specific ordering by mode`
- Add separate tests for Arcade and Sandbox run flow branches.
- Validate that shared lifecycle ordering stays stable across branches.
- Assert branch-specific payload fields where applicable.

4. `test: assert event payload contract snapshots`
- Add focused payload-shape assertions for gameStarted, blocksPopped, gameEnded, modeSelected, modeRulesApplied.
- Prefer explicit field assertions over brittle full-object snapshots.
- Cover value invariants (non-negative scores, valid mode ids, cluster size > 0 on pop events).

5. `refactor: stabilize timing and loop assumptions in tests`
- Remove flake by controlling timing via deterministic helpers/mocks.
- Avoid relying on real animation frames in assertions where possible.
- Keep production logic unchanged unless a tiny test seam is necessary.

6. `chore: finalize validation and pr notes`
- Run typecheck, lint, test, and build locally.
- Capture concise PR notes: what was added, ordering guarantees, known limitations.

## Validation Gates
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Definition of Done
- Coordinator event order is explicitly tested for canonical and branch flows.
- Key event payload contracts are guarded by tests.
- Test suite is stable over repeated runs.
- No gameplay behavior changes introduced.

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
