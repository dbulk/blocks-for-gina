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
- Add storage schema/version changes in src/persistence.
- Add event contracts first in src/events before introducing new pub/sub flows.

## Import Convention

Use alias imports rooted at @/:

- @/core/...
- @/presentation/...
- @/rendering/...
- @/persistence/...
- @/audio/...
- @/events/...
- @/styling/...
