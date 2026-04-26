# Unified Architecture and Hygeine Action Plan

Date: 2026-04-26
Status: Execution-ready ordered sequence

## Goal

Provide one prioritized plan that combines architecture strengthening and code hygeine remediation into a single actionable path with minimal refactor risk.

Refactor checklist: [docs/REFACTOR_GUARD_CHECKLIST.md](docs/REFACTOR_GUARD_CHECKLIST.md)

## Ordered Steps

### 1) Lock Invariants Before Refactor

- Add a refactor guard checklist for each related PR:
	- GameRunner public API unchanged
	- Event ordering unchanged
	- Test/build gates required
- Keep layer-boundary tests active and updated as seams move.

Expected outcome:
- Safe baseline for structural change with low regression risk.

### 2) Decompose Coordinator First (Highest Payoff)

- Extract EndOfRunFinalizer from GameCoordinator:
	- game-over summary payload creation
	- high score/sandbox best persistence
	- gameEnded event emission
- Extract TimedEndHandler:
	- timed no-moves fast-forward
	- timed bonus scoring logic
- Keep GameCoordinator as orchestration entry point only.

Expected outcome:
- Reduced branching/coupling in the highest-risk file.

### 3) Isolate GameState Mode Runtime Concerns

- Move cascade/precision/timed runtime helpers behind a dedicated mode-runtime module owned by GameState.
- Keep grid mutation, invariant checks, and core state ownership in GameState.

Expected outcome:
- Easier reasoning about state transitions and lower chance of cross-mode regressions.

### 4) Formalize Serialization Boundary

- Introduce explicit snapshot translators for persistence/session boundaries.
- Centralize compatibility mappings (arcade->classic, zen->infinite) in one place.

Expected outcome:
- Fewer accidental schema-coupling bugs and clearer compatibility strategy.

### 5) Split Presentation Construction Hotspots

- Break UINodes into section builders:
	- board
	- generation
	- appearance
	- actions
- Keep HTMLInterface focused on composition/state routing, not behavior policy.

Expected outcome:
- Smaller UI change blast radius and more maintainable presentation code.

### 6) Rebalance the Testbed During Refactor

- Preserve/expand event-sequence integration tests while coordinator changes happen.
- Add one resume-visibility end-to-end smoke path using real session snapshot shape.
- Introduce shared test fixtures/constants for common mode ids and run contexts.

Expected outcome:
- Maintains confidence while lowering test maintenance overhead.

### 7) Naming Harmonization Pass

- Rename remaining technical arcade-era artifacts to classic where safe.
- Keep backward-compat behavior at persistence/session boundaries.

Expected outcome:
- Better readability/onboarding and fewer identity mismatch errors.

### 8) Final Documentation Cleanup

- Align architecture docs with new seams and ownership.
- Normalize terminology/spelling and remove drift between backlog/docs.

Expected outcome:
- Documentation reflects reality and stays usable as a contributor guide.

## Delivery Guardrails

- Use plan-first branch workflow per backlog item.
- Keep each step in small, behavior-preserving PRs.
- Require passing test and build checks for every PR.

## Suggested Execution Cadence

1. Step 1
2. Step 2
3. Step 3
4. Step 4
5. Step 5
6. Step 6
7. Step 7
8. Step 8
