# Plan #mode-select-entry

Goal: Make mode selection the first thing a player sees, replacing the generic PLAY button with clear Arcade and Sandbox choices.

## Design rationale
- The current start screen has a single PLAY button that jumps straight to a game. Players never explicitly pick a mode.
- Arcade is competitive (fixed board, trackable scores). Sandbox is exploratory (custom board, no rankings).
- The mode select screen IS the entry point — clicking a mode card starts the game immediately. The old PLAY button is retired.
- Credits (source, music, inspiration) are preserved in the mode select screen so nothing is lost.
- Play Again after game over keeps the same mode for now (#game-over-return-select will add mode-select return later).

## Out of scope
- Return to mode select after game over (that's #game-over-return-select)
- Sandbox custom setup flow (that's #sandbox-setup-flow)
- Mode-aware HUD (that's #mode-aware-hud)

## Target files
- `src/core/moderegistry.ts` — register 'arcade' and 'sandbox' modes
- `src/presentation/modeselectview.ts` — new view (new file)
- `src/styling/gamestyle.ts` — add CSS for mode select cards
- `src/presentation/overlaymanager.ts` — add 'modeSelect' state + 'modeSelect' overlay key
- `src/presentation/htmlinterface.ts` — wire ModeSelectView, add addModeSelectListener, change initial state
- `src/bootstrap/blocks-4-gina.ts` — replace addStartClickListener with addModeSelectListener
- `tests/presentation/modeselectview.test.ts` — new test file

## Commits

### 1. `feat: register arcade and sandbox modes in registry`
- Add `{ id: 'arcade', name: 'Arcade', description: '...' }` and `{ id: 'sandbox', name: 'Sandbox', description: '...' }` to `createDefaultModeRegistry()`.

### 2. `feat: add mode select view and CSS`
- Create `src/presentation/modeselectview.ts`:
  - Two mode cards (Arcade, Sandbox) with name, description, play button.
  - Credits section (source, music, inspiration) preserved from StartOverlayView.
  - `addModeCardClickListener(callback: (modeId: string) => void)` method.
  - `setVisible(onoff: boolean)` method.
- Add CSS classes to `gamestyle.ts`: `mode-select-backdrop`, `mode-select-panel`, `mode-select-title`, `mode-cards`, `mode-card`, `mode-card-title`, `mode-card-desc`, `mode-card-play`. Responsive: two-column on wide, single-column on narrow.

### 3. `feat: add modeSelect state to overlay manager`
- Add `'modeSelect'` to `SessionUIState` union type.
- Add `'modeSelect'` to `OverlayKey` union type.
- Handle `'modeSelect'` in `setState()`: show modeSelect overlay, hide others.

### 4. `feat: wire mode select into HTMLInterface and bootstrap`
- In `HTMLInterface`: import and instantiate `ModeSelectView`, register it, add `addModeSelectListener(callback)`, change initial state from `'preGame'` to `'modeSelect'`, update `setSessionUIState` so the canvas/HUD are also hidden during `'modeSelect'`.
- In `blocks-4-gina.ts`: replace `addStartClickListener` block with `addModeSelectListener` — set `gameSettings.modeId`, transition to `'inGame'`, create `GameRunner`.

### 5. `test: add mode select view tests`
- Create `tests/presentation/modeselectview.test.ts` with `@vitest-environment jsdom`.
- Tests:
  a. ModeSelectView renders with arcade and sandbox cards visible.
  b. Clicking arcade card calls callback with `'arcade'`.
  c. Clicking sandbox card calls callback with `'sandbox'`.
  d. setVisible(false) hides the container.

## Validation
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Definition of done
- Opening the game shows the mode select screen instead of a PLAY button.
- Clicking Arcade starts a game with modeId='arcade' (uses ARCADE_RUN_CONFIG).
- Clicking Sandbox starts a game with modeId='sandbox' (uses settings-based config).
- Credits still visible on the entry screen.
- All gates green.
