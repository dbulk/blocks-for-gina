# Blocks4Gina

Gina was playing blocks at 1001games, I thought the game was ugly and it would be fun to make my own. Mostly I'm just playing around with making a game using canvas api.

## Development

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Test: `npm run test`
- Build: `npm run build`

## Project Structure

- src/bootstrap: entrypoint and app composition.
- src/core: game rules/state/loop orchestration.
- src/presentation: overlays, HUD, and UI controls.
- src/rendering: canvas renderer and block styles.
- src/persistence: high scores and scoreboard integration.
- src/audio: music and sound control.
- src/events: typed event contracts for future event bus work.
- src/styling: stylesheets and style element definitions.
- tests: centralized test tree by responsibility.

## Docs

- docs/ARCHITECTURE.md
- docs/ARCHITECTURAL_ROADMAP.md
- docs/MODULES.md
- docs/EXTENDING_GAME.md
- roadmap.md