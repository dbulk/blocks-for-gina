# Plan: #cascade-mode-v1

## Goal
Ship a first playable Cascade mode where one player pop can trigger automatic follow-up waves, with combo-aware scoring and HUD feedback.

## Scope
- Implement Cascade as a selectable/implemented mode in mode metadata.
- Add runtime cascade wave behavior:
  - Player-triggered pop starts a cascade turn.
  - Follow-up waves auto-pop repeatedly until no clusters remain.
  - Each follow-up wave applies a larger score multiplier.
- Surface cascade metrics in HUD:
  - Current chain depth
  - Combo bonus points gained this chain
  - Best chain depth for the run
- Add/adjust tests for registry, HUD, and cascade coordinator behavior.

## Implementation Steps
1. Enable mode metadata for `cascade` in mode registry.
2. Extend game-state pop helpers to support auto-wave targeting and wave multipliers.
3. Add cascade turn lifecycle in game coordinator:
   - start/advance/finish chain
   - emit block-pop events for player pop and follow-up waves
4. Add HUD metrics for cascade chain/bonus/best chain.
5. Add and update tests:
   - `moderegistry` has implemented cascade
   - `hudpresenter` shows cascade metrics
   - coordinator test validates automatic follow-up wave behavior
6. Run test/build verification and fix regressions.

## Validation
- `npm test`
- `npm run build`

## Out of Scope
- New cascade-specific visual effects beyond existing board animation.
- Balance tuning beyond initial sensible multipliers.
