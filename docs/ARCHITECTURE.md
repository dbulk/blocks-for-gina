# Architecture

This project is organized around clear module boundaries so gameplay changes do not require wide cross-file edits.

## Layers

- core: Game rules, state transitions, scoring, undo/redo, mode-runtime helpers, and coordinator orchestration.
- presentation: DOM views, overlays, HUD, and input controls.
- rendering: Canvas drawing and visual block styles.
- persistence: Local high-score storage plus versioned session snapshot translation.
- bootstrap: Composition root that wires all subsystems together.
- audio: Music and sound effect lifecycle control.
- events: Typed event contracts and the runtime event bus used by coordinator flows.

## Dependency Rules

- core must not import presentation or rendering.
- presentation can read core state and call public APIs.
- rendering can read core state and settings, but no DOM composition.
- persistence can depend on core/presentation types where needed.
- bootstrap is the only place that should instantiate and wire cross-layer dependencies.

## Current Composition Flow

1. bootstrap creates the HTML interface, settings/prefs presenters, renderer, and session storage.
2. bootstrap decides whether to start a new run, open sandbox setup, or resume a saved run.
3. core game runner delegates orchestration to `GameCoordinator` and frame timing to `GameLoopManager`.
4. `GameCoordinator` keeps lifecycle ownership while `EndOfRunFinalizer` handles game-over summary/persistence/event emission and `TimedEndHandler` owns timed fast-forward behavior.
5. `GameState` owns grid mutation/invariants while delegating cascade/precision runtime counters to the mode-runtime helper.
6. persistence translates saved snapshots through an explicit versioned session boundary before resume eligibility is evaluated.

## Current Structural Seams

- `GameCoordinator` still owns most UI listener wiring and mode branching, but the highest-risk end-of-run and timed-end paths have been extracted.
- `GameState` now keeps grid ownership local while mode-runtime counters live behind a dedicated helper module.
- `SessionStorage` now depends on a dedicated session snapshot translator instead of duplicating compatibility mapping in multiple callers.
- `UINodes` still owns the settings toolbar, but section construction has been split into board/generation/appearance/actions builders.

## Validation Guardrails

- `npm run typecheck`
- `npm run test`
- `npm run build`
- event-sequence and resume-path tests stay active as seams move

## Roadmap Link

See roadmap.md for delivery phases and feature direction.

For implementation details when adding new game modes, use `docs/MODE_EXTENSION_API.md`.
