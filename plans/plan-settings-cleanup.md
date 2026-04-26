# Settings Cleanup Plan

Date: 2026-04-26
Status: Proposed implementation plan

## Problem Summary

The bottom toolbar still reflects an older product shape where one expandable settings panel owned:

- board configuration
- clustering
- mode selection
- apply/reset actions
- appearance controls

That model is now stale.

Current product ownership has moved:

- board configuration and clustering belong to Sandbox setup
- mode selection belongs to the home / mode-select screen
- apply/reset actions only make sense when board configuration is editable
- appearance controls remain relevant during gameplay and fit the persistent toolbar better

As a result, the current toolbar mixes active gameplay controls with an outdated expandy panel containing controls that either duplicate other flows or no longer have a valid in-game owner.

## Current-State Findings

### UI ownership drift

- `src/presentation/uinodes.ts` still constructs `Board`, `Generation`, `Appearance`, and `Actions` sections inside a `Settings` expandy.
- `src/presentation/settingspresenter.ts` still treats rows, columns, clustering, and mode id as live toolbar-owned settings.
- `src/presentation/sandboxsetupview.ts` already owns the run-setup inputs for rows, columns, block types, and clustering before a Sandbox run starts.
- `src/bootstrap/blocks-4-gina.ts` already routes mode selection through the home screen and Sandbox setup through the setup overlay.

### Styling/layout mismatch

- `src/styling/gamestyle.ts` devotes a substantial amount of layout and responsive CSS to the `settings-expandy` and section grid.
- Toolbar height is currently coupled to whether the expandy is open via `HTMLInterface.getCanvasSizeConstraints()` and the `UINodes` layout-change listener.

### Presenter split is now uneven

- `PreferencesPresenter` correctly owns appearance/audio preferences.
- `SettingsPresenter` now mostly manages concerns that should no longer live in the gameplay toolbar.
- The likely outcome is either:
  - shrink `SettingsPresenter` to a much smaller surface, or
  - remove it entirely if no remaining owner needs that abstraction.

## Recommended End State

Replace the current bottom-toolbar model with a flat gameplay toolbar that contains only controls relevant while a run is active.

### Keep in the main toolbar

- Home
- Undo / Redo
- Music toggle
- Sound toggle
- Appearance controls:
  - block style selector
  - color controls for the active palette

### Remove from the gameplay toolbar

- Settings expand button
- Board section
- Generation section
- Actions section
- In-game mode selector
- In-game rows / columns / clustering controls
- Apply & New Game
- Reset Defaults

### Keep elsewhere

- mode selection stays on the mode-select screen
- Sandbox run setup stays in `SandboxSetupView`
- preference defaults/reset behavior should remain available, but not necessarily in the gameplay toolbar

## Design Recommendation

Promote appearance controls into the toolbar, but do not blindly inline every current input without considering width.

Recommended approach:

1. Keep the toolbar as one row/cluster of gameplay controls plus a compact appearance group.
2. Move block-style selection into the toolbar directly.
3. Move color inputs into the toolbar as a compact swatch strip that respects the active color count.
4. Avoid reintroducing another hidden panel unless toolbar crowding becomes unmanageable on mobile.

If width becomes a problem, prefer a compact appearance sub-group within the toolbar over a generic settings drawer. The stale problem is not only concealment; it is incorrect ownership.

## Goals

- Make the in-game toolbar reflect only in-game concerns.
- Remove duplicated run-setup controls from gameplay.
- Reduce stale presenter and CSS surface area.
- Preserve appearance customization during active play.
- Keep desktop and mobile layouts stable after toolbar simplification.

## Non-Goals

- redesign Sandbox setup UX beyond moving ownership out of the toolbar
- redesign mode select UX
- change persistence format for preferences
- change gameplay behavior or scoring rules

## Implementation Plan

### Slice 1: Lock the target toolbar contract

- Add or update tests that define the intended gameplay-toolbar surface:
  - settings expand button is absent
  - appearance controls are present directly in the toolbar
  - board/generation/actions controls are absent from gameplay UI
- Decide whether reset-to-defaults remains exposed somewhere or is deferred to a later preferences-specific surface.

Primary files:

- `tests/presentation/uinodes.test.ts`
- `tests/presentation/settingspresenter.test.ts`
- possibly new presenter/bootstrap tests for removed interactions

### Slice 2: Remove stale run-setup controls from `UINodes`

- Delete the expand button and the `divSettings` panel.
- Remove board/generation/actions section builders.
- Keep or reshape the appearance builder so it renders directly in the toolbar root.
- Keep `setColorInputCount`, `setInputColors`, and `setInputBlockStyle` as public UI APIs if they are still needed by preferences.

Primary files:

- `src/presentation/uinodes.ts`
- `src/styling/gamestyle.ts`
- `tests/presentation/uinodes.test.ts`

### Slice 3: Simplify presenter ownership

- Remove rows/columns/clustering/mode sync from `SettingsPresenter`.
- Decide whether `SettingsPresenter` becomes:
  - a tiny gameplay settings bridge, or
  - removable entirely
- Keep `PreferencesPresenter` as the owner of block style, colors, and audio preferences.

Primary files:

- `src/presentation/settingspresenter.ts`
- `src/presentation/preferencespresenter.ts`
- `src/core/gamecoordinator.ts`
- `src/bootstrap/blocks-4-gina.ts`
- `tests/presentation/settingspresenter.test.ts`

### Slice 4: Rewire gameplay listeners to the remaining toolbar controls

- Remove event wiring for apply/reset and obsolete run-setup fields from coordinator/bootstrap.
- Keep audio toggle wiring where it already exists unless ownership cleanup makes a smaller abstraction obvious.
- Ensure block-style and color updates still apply live during gameplay.

Primary files:

- `src/core/gamecoordinator.ts`
- `src/bootstrap/blocks-4-gina.ts`
- `src/presentation/uinodes.ts`

### Slice 5: Clean up layout + responsive behavior

- Remove CSS for `settings-expandy`, section cards, section rows, and unused form styles.
- Add compact toolbar styling for block-style select and color swatches.
- Recheck canvas height/layout behavior now that the expandy no longer changes toolbar height dramatically.

Primary files:

- `src/styling/gamestyle.ts`
- `src/presentation/htmlinterface.ts`
- `tests/presentation/htmlinterface.test.ts`

### Slice 6: Final dead-code and naming cleanup

- Delete unused UI APIs that only existed for the old settings panel.
- Remove obsolete tests and fixture scaffolding for in-game run setup.
- Update docs if toolbar responsibilities changed materially.

Primary files:

- `src/presentation/uinodes.ts`
- `src/presentation/settingspresenter.ts`
- `tests/presentation/**`
- `docs/ARCHITECTURE.md`
- `docs/MODULES.md`

## Risks

### 1. Toolbar crowding on mobile

Promoting appearance controls can create width/height pressure.

Mitigation:

- keep the appearance group compact
- validate on narrow widths
- prefer wrapping within the toolbar over a generic catch-all settings drawer

### 2. Hidden dependency on removed presenter APIs

`SettingsPresenter` and `UINodes` currently expose more surface than the product still needs.

Mitigation:

- remove obsolete APIs in small slices
- let focused tests fail before broad deletions

### 3. Canvas sizing regressions

Toolbar height affects available canvas height.

Mitigation:

- run interface/layout tests after the toolbar shrink
- manually validate mode select -> in game -> resize

## Validation Plan

- `npm run typecheck`
- focused UI tests:
  - `tests/presentation/uinodes.test.ts`
  - `tests/presentation/settingspresenter.test.ts`
  - `tests/presentation/htmlinterface.test.ts`
- relevant integration tests if toolbar wiring moves:
  - `tests/bootstrap/blocks-4-gina.mode-flow.integration.test.ts`
  - `tests/core/gamecoordinator.event-sequence.test.ts`
- `npm run build`

## Suggested Commit Sequence

1. `define flat toolbar target`
2. `remove settings expandy`
3. `move appearance controls into toolbar`
4. `shrink settings presenter surface`
5. `remove obsolete toolbar actions`
6. `clean toolbar styles`
7. `prune dead settings code`

## Recommendation

Proceed with the cleanup.

The current toolbar is stale by ownership, not just by aesthetics. The strongest version of this cleanup is to make the gameplay toolbar explicitly gameplay-plus-appearance, and to delete the generic settings expandy instead of trying to repurpose it.