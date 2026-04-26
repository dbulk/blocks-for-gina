# Blocks4Gina

Gina was playing blocks at 1001games, I thought the game was ugly and it would be fun to make my own. Mostly I'm just playing around with making a game using canvas api.

## Development

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Test: `npm run test`
- Build: `npm run build`

## Project Structure

- src/bootstrap: entrypoint, mode-select flow, and resume wiring.
- src/core: game rules/state/loop orchestration plus extracted coordinator helpers.
- src/presentation: overlays, HUD, and UI controls.
- src/rendering: canvas renderer and block styles.
- src/persistence: high scores and versioned session snapshot translation.
- src/audio: music and sound control.
- src/events: typed event contracts and the event bus used by runtime flows.
- src/styling: stylesheets and style element definitions.
- tests: centralized test tree by responsibility.

## Docs

- docs/ARCHITECTURE.md
- docs/REFACTOR_GUARD_CHECKLIST.md
- docs/MODULES.md
- docs/EXTENDING_GAME.md
- docs/MODE_EXTENSION_API.md
- roadmap.md