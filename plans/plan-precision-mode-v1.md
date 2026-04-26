# Plan: #precision-mode-v1

## Goal
Ship a first playable Precision mode where players must match exact target cluster sizes, manage strikes, and build exact-hit streak bonuses.

## Scope
- Implement Precision mode in mode metadata and rules.
- Add per-turn target cluster behavior:
  - Show target size in HUD.
  - Only exact-size pops score.
  - Non-matching attempts add a strike.
- Add game-over condition and scoring flavor:
  - Three strikes ends the run.
  - Exact-hit streaks apply a score multiplier.
- Add HUD metrics for target, strikes, and streak.
- Add tests for rule termination, coordinator flow, and HUD rendering.

## Implementation Steps
1. Enable precision mode metadata in default mode registry.
2. Add precision runtime state to game state (target, strikes, streak) with serialization support.
3. Add precision end-rule hook (three strikes or no moves).
4. Add coordinator precision turn handling:
   - validate exact target hit
   - apply hit multiplier/streak
   - apply strikes on misses
   - assign next target after each turn
5. Add precision HUD metrics and mode-specific labels.
6. Add/adjust tests in mode rules, coordinator sequence, HUD presenter, and mode select fixture.
7. Run test/build verification and fix regressions.

## Validation
- `npm test`
- `npm run build`

## Out of Scope
- Advanced target balancing curves.
- Precision-specific VFX/audio.
