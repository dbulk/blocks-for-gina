# Plan #sprint-mode-v1

Goal: Ship first playable sprint mode with a 10-move budget.

## Implementation Steps

### 1. `feat: configure sprint mode as playable`
- Set `SPRINT_MODE_MAX_MOVES` to 10 in mode rules.
- Mark `sprint` as implemented in mode registry so it can be selected.

### 2. `feat: wire sprint game-over summary details`
- Add sprint-specific game-over title (`Sprint Complete!`).
- Show sprint move usage as `used/10` in summary metrics.
- Keep ranked leaderboard behavior for sprint (competitive mode).

### 3. `test: update mode rule and HUD budget assertions`
- Update sprint end-condition test to assert 9 is not over and 10 is over.
- Update HUD sprint budget test to use the 10-move budget thresholds.

### 4. `test: add sprint integration assertions`
- Extend coordinator event-sequence coverage to ensure sprint emits `gameEnded` after 10 moves.

## Notes
- Sprint still ends early if no valid moves remain.
- Warning tone threshold for moves-left stays at `<= 5`.
