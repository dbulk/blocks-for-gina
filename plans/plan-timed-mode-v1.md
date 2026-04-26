# Plan #timed-mode-v1

Goal: Ship first playable timed mode.

## Implementation Steps

### 1. `feat: reduce timed duration to 60s and mark mode implemented`
- Change `TIMED_MODE_DURATION_SECONDS` from 180 → 60 in `moderules.ts`
- Mark `timed` as `implemented: true` in `moderegistry.ts`
- HUD countdown and end condition already wired (`shouldEndGameForMode`, `HudPresenter`) — no changes needed there

### 2. `feat: timed game-over summary title`
- `GameOverOverlayView.setSummary()` receives `modeId`; set title to "Time's Up!" for timed mode instead of "Game Over"
- For timed mode the summary should show: Score, Blocks Popped, Largest Cluster, Moves (no "Blocks Remaining" — game didn't end by exhaustion)
- Hide `blocksRemainingValue` card for timed mode

### 3. `test: timed mode end condition and HUD`
- Test `shouldEndGameForMode('timed', ...)` triggers when elapsed >= 60s
- Test `HudPresenter` countdown value and warning tone at ≤30s (already partially tested — verify threshold matches 60s duration)
- Test `GameOverOverlayView.setSummary()` sets title to "Time's Up!" for timed mode

### 4. `test: timed mode integration flow`
- Event-sequence test: timed mode `gameEnded` fires with `modeId: 'timed'` when timer expires

## Notes
- `GameState.getPlayedDuration()` uses wall-clock elapsed ms — works for timed end condition
- Warning tone threshold (≤30s remaining) still valid for 60s game
- Do NOT change `isCompetitiveMode` — timed scores should enter the leaderboard
