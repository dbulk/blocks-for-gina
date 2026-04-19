# Plan #leaderboard-per-mode

Goal: Partition competitive scores by game mode.

## Commits
1. `refactor: introduce per-mode leaderboard schema`
- Add mode keying in high score storage model.

2. `feat: write scores into mode buckets`
- Route score inserts by modeId.

3. `feat: read and render top entries by active mode`
- Update summary rendering to use mode bucket.

4. `test: add per-mode ranking tests`
- Verify independent lists and tie handling.

5. `refactor: add storage migration for legacy entries`
- Safely map old global list into Arcade bucket.
