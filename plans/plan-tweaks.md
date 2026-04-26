# Plan: #tweaks

## Goal
Implement the backlog tweaks in one branch/PR:
1) Rename arcade mode to classic across source refs and player-facing UI.
2) End timed mode when no moves remain, add 100 points per remaining second, and show a rapid countdown-to-zero effect.
3) Improve fade animation feel, including reducing/removing the game-over to new-game transition jank.

## Implementation Steps

1. Rename mode id + label from arcade/Arcade to classic/Classic:
- Update default mode registry id/name.
- Update coordinator/defaults/resume fallbacks/select view defaults/high score default mode id and compatibility mappings.
- Keep backwards compatibility by mapping legacy saved mode id `arcade` to `classic` where sessions/scores may still contain old ids.

2. Timed no-moves behavior:
- Update timed end-rule hook so timed mode ends on time limit OR no-more-moves.
- Add game-state helper(s) needed to support clock fast-forward and score bonus adjustments safely.
- In coordinator game-over path for timed/no-moves before timer expiry:
  - Award bonus: remainingSeconds * 100.
  - Animate timer quickly to zero before summary display (rapid countdown effect).

3. Animation polish:
- Shorten/adjust game-over overlay transition timing and ease to remove sluggishness.
- Remove extra fade-in delay on immediate transitions where it feels janky (game over -> new game/home path).

4. Tests:
- Update existing mode-id tests from arcade->classic.
- Add/adjust timed-rule tests for no-moves termination.
- Add coordinator tests for timed no-moves bonus and countdown fast-forward behavior.
- Update any presentation tests affected by transition defaults.

5. Verify:
- npm test
- npm run build

## Notes
- Keep changes scoped to #tweaks backlog item only.
- Prefer compatibility shims for legacy saved ids instead of breaking old localStorage data.
