# Plan #leaderboard-per-mode

Goal: Partition competitive scores by game mode.

## Implementation Steps

### 1. `refactor: add mode bucketed high score schema`
- Update `LocalHighScores` storage model from `HighScoreEntry[]` to `{ [modeId: string]: HighScoreEntry[] }`
- Introduce a mode-aware read/write path with default bucket `'arcade'`

### 2. `refactor: add migration from v1 global list`
- If stored payload is legacy array, migrate to `{ arcade: legacyEntries }`
- Keep storage key stable (`b4g_highscores_v1`) and migrate on read/write transparently

### 3. `feat: write/read per-mode scores`
- Update `record()` and `getTopEntries()` APIs to accept `modeId`
- Rank and trim entries within the selected mode bucket only

### 4. `feat: route game-over persistence by mode`
- In `GameCoordinator`, call `highScores.record(entry, modeId)` for competitive modes
- Keep sandbox personal-best flow unchanged

### 5. `test: add per-mode and migration coverage`
- Add persistence tests proving arcade and timed lists remain isolated
- Add migration test proving legacy list lands in arcade bucket
- Update any coordinator tests that stub `highScores.record` signature

## Notes
- `isCompetitiveMode(modeId)` remains the gate; sandbox still bypasses ranked leaderboard
- Tie-breaking order remains score desc, elapsed asc, playedAt desc within each mode bucket
