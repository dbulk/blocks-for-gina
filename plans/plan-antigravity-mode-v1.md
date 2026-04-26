# Plan: #antigravity-mode-v1

## Goal
Ship Antigravity as a playable mode where blocks rise upward after pops, changing board-shape planning while preserving core pop mechanics.

## Scope
- Enable `antigravity` mode in registry so it is selectable.
- Add gravity direction support to game-state block settling logic:
  - Default gravity remains downward for existing modes.
  - Antigravity settles blocks upward.
- Preserve renderer animation correctness for both gravity directions.
- Wire mode -> gravity direction in coordinator for new runs and restored sessions.
- Add tests for antigravity settling and mode availability.

## Implementation Steps
1. Introduce gravity direction state (`down`/`up`) in `GameState` with setter.
2. Update removal + vertical settle logic to honor active gravity direction.
3. Support signed vertical offsets so upward animation settles correctly.
4. Set game-state gravity in `GameCoordinator` based on selected/restored mode.
5. Mark `antigravity` as implemented in mode registry.
6. Add/adjust tests:
   - game-state antigravity upward settle behavior
   - registry implemented flag for antigravity
   - mode-select test fixture availability
7. Run `npm test` and `npm run build`.

## Validation
- `npm test`
- `npm run build`

## Out of Scope
- New visual shader/effect pass specific to antigravity.
- Additional antigravity-specific scoring rules.
