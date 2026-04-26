# Modules

## Folder Map

- src/bootstrap: Entrypoint and app composition.
- src/core: Stateful game domain logic.
- src/presentation: UI and view-layer modules.
- src/rendering: Canvas rendering and block styles.
- src/persistence: High score persistence and scoreboard integration.
- src/audio: Sound/music controller(s).
- src/events: Typed event definitions.
- src/styling: Global and component style sources.
- tests: Centralized test tree mirroring src responsibilities.

## Ownership Guide

- Add new game rules or state metrics in src/core.
- Add new overlays, HUD widgets, or settings controls in src/presentation.
- Add new block visuals or draw optimizations in src/rendering.
- Add storage schema/version changes and compatibility translators in src/persistence.
- Add event contracts first in src/events before expanding pub/sub flows.

## Notable Seams

- `src/core/gamecoordinator.ts`: run lifecycle orchestration, mode branching, and UI listener ownership.
- `src/core/endofrunfinalizer.ts`: game-over summary payload creation, score persistence, and `gameEnded` emission.
- `src/core/timedendhandler.ts`: timed-mode no-moves fast-forward and bonus scoring.
- `src/core/gamemoderuntime.ts`: cascade and precision runtime counters owned by `GameState`.
- `src/persistence/sessionsnapshot.ts`: versioned session snapshot translation and compatibility mapping.
- `src/presentation/uinodes.ts`: toolbar shell plus section builders for board, generation, appearance, and actions.

## Import Convention

Use alias imports rooted at @/:

- @/core/...
- @/presentation/...
- @/rendering/...
- @/persistence/...
- @/audio/...
- @/events/...
- @/styling/...

Tests use relative imports inside `tests/` for shared fixtures such as `tests/fixtures/runcontext.ts`.
