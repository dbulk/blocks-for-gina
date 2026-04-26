# Backlog

## AI Execution Workflow

See [ai-workflow.md](ai-workflow.md) for the full step-by-step execution process.

## #precision-mode-v1
Precision mode first playable version
- Each turn sets a target cluster size to hit (shown in HUD)
- Only exact-size pops score; misses add a strike
- Three strikes ends the run, while streaks of exact hits boost score

## #antigravity-mode-v1
Antigravity mode first playable version
- Blocks float upward instead of falling down
- Clear from the top of the board
- New gravity direction rendering pass

## #mode-hook-test-isolation
Add reset helpers for mode hook state in tests
- Add deterministic reset helpers for mode rule and summary hook registries
- Use reset hooks in tests to avoid cross-test contamination

## #mode-extension-doc-consolidation
Consolidate mode extension docs entry points
- Make one canonical mode-extension guide
- Add cross-links from other docs to avoid drift

## #mode-registration-error-ergonomics
Improve mode registration validation diagnostics
- Include field and value context consistently in validation errors
- Keep errors actionable for mode authoring

## #tweaks
- rename arcade to classic, make sure to do it in refs in source as well as in player-facing behavior
- timed games should end when out of moves, even if there's time remaining, ideally we could show the timer really quickly count down to zero as a cool visual effect when this happens
- fade animations are a little janky, making these nicer and maybe eliminating the animation from game over screen to new game screen might be nice. Should look pro


## #arch-hygiene
- Do a deep analysis of code-hygeine issues and make a hygeine-report
- Look for architectural patterns that aren't growing well, make a plan to strengthen the architecture for future features and to grow strength
- Evaluate the test bed for both under and over-testing, and adjust as needed to ensure confidence without excessive maintenance burden