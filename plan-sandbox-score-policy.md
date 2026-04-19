# Plan #sandbox-score-policy

Goal: Keep Sandbox non-competitive while preserving personal feedback.

## Commits
1. `feat: add score eligibility policy by mode`
- Introduce competitive eligibility map.

2. `refactor: gate leaderboard writes behind eligibility`
- Skip ranked insert for Sandbox runs.

3. `feat: add sandbox personal best storage`
- Save local-only sandbox best separately.

4. `feat: render sandbox summary stats`
- Show personal best and run metrics without rank.

5. `test: add sandbox policy tests`
- Validate rank exclusion and personal best updates.
