# Plan #game-over-return-select

Goal: After every run, give the player a "Change Mode" button alongside "Play Again" in the game-over overlay, so they can return to the mode-select screen without reloading.

## Context

Current flow:
- `GameCoordinator` wires `page.addPlayAgainClickListener` → `startNewGameFromUI()` (restarts same mode)
- No way to return to mode select without a hard reload

Target flow:
- Game-over overlay shows two buttons: **Play Again** (same mode, same coordinator) and **Change Mode** (returns to modeSelect state)
- "Change Mode" calls `page.setSessionUIState('modeSelect')` from bootstrap, creating a fresh `GameRunner` on next Play

## Design decisions
- Keep `GameRunner` / `GameCoordinator` stateless about navigation; routing lives in bootstrap
- `addChangeModeClickListener` added to `HTMLInterface` (mirrors `addPlayAgainClickListener`)
- `GameOverOverlayView` gets a second button; buttons sit in a row, Play Again primary styled, Change Mode secondary/ghost
- No enum or action type needed — two separate callbacks is simpler and consistent with existing pattern
- On "Change Mode" the existing `GameRunner` is simply abandoned (game is over; no cleanup needed)

## Target files
- `src/presentation/gameoveroverlayview.ts` — add Change Mode button, `addChangeModeClickListener`
- `src/presentation/htmlinterface.ts` — add `addChangeModeClickListener` method
- `src/bootstrap/blocks-4-gina.ts` — wire Change Mode → `setSessionUIState('modeSelect')`; extract `startGame(modeId)` helper to avoid duplicating GameRunner construction
- `src/styling/gamestyle.ts` — button-row CSS for game-over overlay actions (if needed)
- `tests/presentation/gameoveroverlayview.test.ts` — new: verify both buttons exist and fire correct callbacks

## Commits
1. `feat: add Change Mode button to game-over overlay` — view + htmlinterface
2. `feat: wire Change Mode to return to mode select in bootstrap` — bootstrap refactor
3. `test: add game-over overlay navigation tests`
4. remove plan file
