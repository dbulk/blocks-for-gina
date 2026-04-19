# Extending the Game

## Add a New Gameplay Feature

1. Add state and rules in src/core.
2. Add or update typed event contract in src/events/events.ts.
3. Update view behavior in src/presentation if user-facing.
4. Update renderer only if visuals need to change.
5. Add persistence updates only if data must survive sessions.
6. Add tests in tests/ matching affected layer(s).

## Add a New Game Mode (Planned)

1. Introduce mode contract and mode registry.
2. Keep mode logic in core; avoid embedding mode rules in presentation.
3. Extend game-over summaries and persistence schema per mode.
4. Add mode-specific tests for win/lose conditions.

## Add New Settings

1. Add field/default/serialization in core settings.
2. Add control in presentation UI nodes.
3. Keep mapping logic narrow so settings internals stay decoupled from UI details.
4. Validate with typecheck + tests + manual new game flow.

## Regression Checklist

- New game starts successfully.
- Undo/redo still works.
- HUD updates match gameplay.
- Game-over summary appears and high scores persist.
- Build and tests remain green.
