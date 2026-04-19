# Plan #arcade-default-config

Goal: Lock Arcade mode to a curated competitive baseline so all Arcade runs start from the same board parameters regardless of what the settings UI contains.

## Out of scope
- Mode card UI display (blocked on #mode-select-entry)
- Schema or persistence changes (belongs in #session-schema-v2)

## Target files
- `src/core/arcadeconfig.ts` — new constants file
- `src/core/gamecoordinator.ts` — apply arcade config in newGame()
- `tests/core/arcadeconfig.test.ts` — new test file

## Commits

### 1. `feat: add arcade run config constants`
- Create `src/core/arcadeconfig.ts` exporting a typed `ARCADE_RUN_CONFIG` const.
- Fields: `numRows`, `numColumns`, `numBlockTypes`, `clusterStrength`.
- Values: 10 rows, 20 columns, 5 block types, 0.2 cluster strength (matches current defaults, locked for competitive fairness).

### 2. `feat: apply arcade config override in coordinator newGame`
- In `GameCoordinator.newGame()`, when `this.settings.modeId === 'arcade'`, read run params from `ARCADE_RUN_CONFIG` instead of `this.settings`.
- Non-arcade modes continue to use settings values unchanged.
- The `gameStarted` event payload must also reflect the arcade values when in arcade mode.

### 3. `test: add arcade config enforcement tests`
- Add `tests/core/arcadeconfig.test.ts` with `@vitest-environment jsdom`.
- Tests:
  a. Arcade start uses ARCADE_RUN_CONFIG values regardless of settings (mutate settings to unusual values, start; assert gameStarted payload matches ARCADE_RUN_CONFIG).
  b. Non-arcade start uses settings values (classic mode with custom settings; assert gameStarted payload matches settings).
  c. ARCADE_RUN_CONFIG values are within valid board bounds (5–100 rows/cols, 2–8 block types, 0–1 cluster strength).

## Validation
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Definition of done
- Arcade runs always use locked config regardless of UI settings.
- Non-arcade runs unaffected.
- All gates green.
