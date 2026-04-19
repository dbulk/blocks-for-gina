# Backlog

## AI Execution Workflow

See [ai-workflow.md](ai-workflow.md) for the full step-by-step execution process.

## #mode-select-entry
Mode picker landing screen
- Arcade and Sandbox as first choices
- Clear mode card affordances
- Future modes discoverable

## #game-over-return-select
Post-run return to mode selection
- Replace auto-restart behavior
- Keep replay same mode option
- Preserve summary before transition

## #settings-split
Persistent prefs vs run setup split
- Preferences: audio and visuals only
- Run setup: board generation and mode knobs
- Remove mixed semantics in one panel

## #sandbox-setup-flow
Sandbox setup before game start
- Rows, columns, clustering inputs
- Validate and clamp user values
- Build run config payload

## #mode-context-plumbing
Mode and run context propagation
- Mode ID in start and end payloads
- Setup payload attached to run
- Coordinator consumes context consistently

## #leaderboard-per-mode
Competitive leaderboard partitioning
- Track scores by competitive mode
- Keep per-mode top entries
- Add migration-safe schema update

## #sandbox-score-policy
Sandbox non-competitive stats policy
- Exclude Sandbox from ranked board
- Optional personal best only
- Keep competitive lists clean

## #timed-mode-v1
Timed mode first playable version
- 180 second match timer
- End condition on timer expiry
- Mode-specific game-over summary

## #move-limited-v1
Move-limited mode first playable version
- Fixed move budget
- End condition on budget exhaustion
- Mode-specific summary details

## #mode-aware-hud
HUD variants by active mode
- Timer prominence for timed mode
- Remaining moves for move-limited
- Mode label and compact state

## #mode-flow-integration-tests
Mode lifecycle integration coverage
- Select mode -> start run flow
- End run -> return to selection flow
- Replay same mode branch coverage

## #session-schema-v2
Session schema for split settings model
- Persist preferences separately
- Keep run setup ephemeral by default
- Versioned migrate-on-load behavior

## #mode-extension-api
New mode authoring contract
- Mode registration checklist
- Rule hooks and summary hooks
- Test template for new mode PRs
