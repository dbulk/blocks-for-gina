# Architecture

This project is organized around clear module boundaries so gameplay changes do not require wide cross-file edits.

## Layers

- core: Game rules, state transitions, scoring, undo/redo, and serialization primitives.
- presentation: DOM views, overlays, HUD, and input controls.
- rendering: Canvas drawing and visual block styles.
- persistence: Local high-score storage and score/HUD bridging.
- bootstrap: Composition root that wires all subsystems together.
- audio: Music and sound effect lifecycle control.
- events: Typed event contracts for upcoming event-bus integration.

## Dependency Rules

- core must not import presentation or rendering.
- presentation can read core state and call public APIs.
- rendering can read core state and settings, but no DOM composition.
- persistence can depend on core/presentation types where needed.
- bootstrap is the only place that should instantiate and wire cross-layer dependencies.

## Current Composition Flow

1. bootstrap creates HTML interface, settings, and renderer.
2. core game runner initializes game state and loop.
3. presentation surfaces controls and overlays.
4. rendering draws block state each frame.
5. persistence records game-over results.

## Near-Term Refactor Seams

- Split game runner into coordinator + loop manager.
- Introduce settings presenter to decouple settings from UI node details.
- Add overlay registry to remove hardcoded overlay ownership from HTML interface.
- Move from dirty-flag polling to typed events in events module.

## Roadmap Link

See roadmap.md for delivery phases and feature direction.
