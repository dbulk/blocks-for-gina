# Plan #move-limited-v1

Goal: Ship first playable move-limited mode.

## Commits
1. `feat: add move limit constants and mode config`
- Define move budget in mode rules.

2. `refactor: enforce move budget in coordinator`
- End run when total moves reaches limit.

3. `feat: expose remaining moves metric`
- Add remaining move metric in HUD presenter.

4. `feat: add move-limited summary details`
- Show move budget usage and final score.

5. `test: add move-limited mode tests`
- Verify budget decrement and end behavior.

6. `test: add move-limited integration flow`
- Mode select -> run -> budget exhausted -> summary.
