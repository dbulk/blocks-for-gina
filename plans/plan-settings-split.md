# Plan #settings-split

Goal: Settings becomes cosmetics-only (audio + appearance). Board params and mode live elsewhere — mode is chosen at the mode-select screen; board params will be wired in #sandbox-setup-flow. Cosmetics apply live without a game restart.

## Vision
- **Mode select screen** → pick Arcade / Sandbox (done)
- **Settings panel** → audio toggles + block style + block colors only — live apply, no "Apply & New Game"
- **Sandbox-specific setup** → rows/cols/clustering (deferred to #sandbox-setup-flow)
- **No mode dropdown in settings** — mode comes from the mode-select screen, stored as `GameSettings.modeId` but not exposed in the settings UI

## Domain model changes

### New: `UserPreferences` (`src/core/userpreferences.ts`)
Fields: `isMusicEnabled`, `isSoundEnabled`, `blockStyle`, `blockColors`
- Persists to `localStorage` key `b4g_prefs_v1` on every change (live)
- Loaded on boot in bootstrap, passed to coordinator
- Independent of session storage — survives session expiry

### Changed: `GameSettings` (`src/core/gamesettings.ts`)
Remove: `isMusicEnabled`, `isSoundEnabled`, `blockStyle`, `blockColors`
Remains: `numRows`, `numColumns`, `numBlockTypes`, `clusterStrength`, `modeId`, `blockLabels`
- Serialized in session snapshot for mid-run resume only
- No longer exposed in the UI settings panel (board params will surface in sandbox setup flow)

### Changed: Session storage schema
- Bump to version 2
- `settings` payload now only contains board params (no audio/cosmetics)
- Graceful migration: v1 snapshots discarded (fresh game on stale data)

## UI changes (`src/presentation/uinodes.ts`)

Settings panel sections to KEEP:
- Appearance: block style selector, color pickers — apply live via `inputBlockStyle` / `inputColors` listeners
- Audio: already live via toggle buttons in toolbar (no change)

Settings panel sections to REMOVE:
- Board section (rows, columns)
- Generation section (clustering, mode dropdown)
- Actions section ("Apply & New Game", "Reset Defaults")

`cmdApplySettings` and `cmdResetSettings` removed.
`expandButton` label stays "Settings", but only reveals cosmetics.

## SettingsPresenter changes (`src/presentation/settingspresenter.ts`)
- Remove `uiToSettings()` (no writable board params in UI)
- Remove `uiAllToSettings()` (no longer valid)
- Remove `uiColorsToSettings()` — becomes part of `PreferencesPresenter`
- Keep `settingsToUI()` only for initial load of board params (used at coordinator boot, no-op for UI since those controls are gone)

## New: `PreferencesPresenter` (`src/presentation/preferencespresenter.ts`)
- Takes `UserPreferences` + `UINodes`
- `prefsToUI()` — sets music/sound toggles, block style, colors
- Wires live-apply: blockStyle change → `prefs.blockStyle = ...; prefs.save(); renderer.setBlockStyle(...)`
- Wires colors change → `prefs.blockColors = ...; prefs.save()`
- Audio toggles already wired — just need to persist to prefs instead of settings

## GameCoordinator changes
- Accepts `UserPreferences` as a new constructor parameter (after `settings`)
- Uses `prefs.blockStyle`, `prefs.blockColors`, `prefs.isMusicEnabled`, `prefs.isSoundEnabled`
- Audio state reads from `prefs` not `settings`
- `serialize()` no longer saves audio/cosmetics (they live in prefs localStorage)
- `deserialize()` no longer restores audio/cosmetics from session

## Bootstrap changes (`src/bootstrap/blocks-4-gina.ts`)
- Create `UserPreferences` first, load from localStorage
- Create `PreferencesPresenter(prefs, ui)` and call `prefsToUI()`
- Pass `prefs` to `GameRunner`/`GameCoordinator`

## Target files
- `src/core/userpreferences.ts` *(new)*
- `src/core/gamesettings.ts` — remove audio/cosmetic fields
- `src/persistence/sessionstorage.ts` — bump version to 2
- `src/presentation/uinodes.ts` — remove board/generation/actions sections
- `src/presentation/settingspresenter.ts` — strip down to board-only operations
- `src/presentation/preferencespresenter.ts` *(new)*
- `src/core/gamecoordinator.ts` — accepts prefs, reads audio/cosmetics from prefs
- `src/bootstrap/blocks-4-gina.ts` — create and wire prefs

## Commits
1. `feat: add UserPreferences model with localStorage persistence`
2. `refactor: remove audio and cosmetics from GameSettings`
3. `refactor: strip board/mode controls from settings panel (cosmetics only)`
4. `feat: add PreferencesPresenter for live cosmetics apply`
5. `refactor: wire UserPreferences through coordinator and bootstrap`
6. `test: add UserPreferences persistence and presenter tests`
7. remove plan file
