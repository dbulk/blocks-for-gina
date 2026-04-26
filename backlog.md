# Backlog

## AI Execution Workflow

See [ai-workflow.md](ai-workflow.md) for the full step-by-step execution process.

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

## #zen-mode-v1
Zen mode first playable version
- No timer, no move limit, no game over state
- Infinite play until player exits, blocks reappear after popping
- No competitive scoring or leaderboard entry

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

## #antigravity-mode-v1
Antigravity mode first playable version
- Blocks float upward instead of falling down
- Clear from the top of the board
- New gravity direction rendering pass

## #tweaks
- rename arcade to classic, make sure to do it in refs in source as well as in player-facing behavior
- timed games should end when out of moves, even if there's time remaining, ideally we could show the timer really quickly count down to zero as a cool visual effect when this happens
- zen mode should be called infinite not zen