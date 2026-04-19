# Plan #mode-aware-hud

Goal: Make HUD adapt to active mode with relevant metrics.

## Commits
1. `refactor: add mode-aware hud metric model`
- Extend HudMetric model with optional mode fields.

2. `feat: map timed and move-limited metrics in presenter`
- Provide countdown and remaining moves metrics.

3. `feat: update score display rendering for dynamic metrics`
- Render mode metrics conditionally and consistently.

4. `feat: add active mode label to hud`
- Keep mode context visible during gameplay.

5. `test: add mode-aware hud presenter tests`
- Validate metric mapping by mode.
