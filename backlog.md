# Backlog

## AI Execution Workflow

See [ai-workflow.md](ai-workflow.md) for the full step-by-step execution process.

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

## #sprint-mode-v1
Sprint mode first playable version
- Fixed move budget (30 moves)
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

## #mode-extension-api
New mode authoring contract
- Mode registration checklist
- Rule hooks and summary hooks
- Test template for new mode PRs

## #antigravity-mode-v1
Antigravity mode first playable version
- Blocks float upward instead of falling down
- Clear from the top of the board
- New gravity direction rendering pass

## #cascade-mode-v1
Cascade mode first playable version
- Each pop triggers a chain reaction on neighbours
- Combo multiplier scoring
- Chain animation and combo HUD indicator

## #precision-mode-v1
Precision mode first playable version
- Define minimum cluster size to score
- Pops below threshold do not count
- HUD shows minimum cluster requirement

## #zen-mode-v1
Zen mode first playable version
- No timer, no move limit, no game over state
- Infinite play until player exits
- No competitive scoring or leaderboard entry

## #sandbox-mode-v1
Sandbox mode first playable version (depends on #sandbox-setup-flow)
- Board config screen before game start
- Rows, columns, clustering, block count inputs
- Non-competitive, no leaderboard entry
