# Plan #game-over-return-select

Goal: End every run by returning to game type selection.

## Commits
1. `refactor: add post-game navigation action`
- Add explicit next-step action enum after game over.
- Replace implicit restart behavior.

2. `feat: add return-to-select action in summary overlay`
- Add button for Back to Game Types.
- Keep Play Again option for same mode.

3. `refactor: coordinator handles post-game branching`
- Route replay action to same mode start.
- Route back action to mode selection state.

4. `test: add game-over navigation flow tests`
- Validate both branches from summary overlay.
- Ensure no stale run context leaks.

5. `docs: document post-run behavior`
- Update roadmap and flow docs.
