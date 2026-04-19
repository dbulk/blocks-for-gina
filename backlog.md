# Backlog

## AI Execution Workflow
- Pick one backlog tag and create a branch named `feat/<tag-without-hash>` (example: `#mode-aware-hud` -> `feat/mode-aware-hud`).
- Read the matching plan file (`plan-<tag-without-hash>.md`) and expand it into concrete implementation steps before coding. Commit the expanded plan as the first commit on the branch.
- Implement in small increments with short one-line commits.
- Before opening the PR, delete the plan file (`git rm plan-<tag-without-hash>.md`) and commit the removal. Plan files are branch-scoped working documents and must never land on main.
- Keep changes scoped to the selected backlog item; if scope shifts, update related backlog and plan files in the same branch.
- Push the branch and open a PR using a heredoc to avoid literal `\n` in the body:
  ```sh
  gh pr create --base main --head feat/<tag> --title "<title>" --body "$(cat <<'EOF'
  ## Summary
  ...

  ## What changed
  - ...

  ## Commits
  - `abc1234` message

  ## Validation
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
  EOF
  )"
  ```
- Alternatively write the body to a temp file and pass `--body-file body.md`, then delete the file.
- In the PR body, include: summary of changes, commit list, test/build evidence, and any follow-up items.
- Require human review before merge; do not self-merge.
- After merge, remove the completed item from this backlog and adjust remaining backlog items/plans as needed.

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

## #arcade-default-config
Curated Arcade baseline
- Fixed board generation defaults
- No board-shape tuning in Arcade
- Consistent competitive baseline

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

## #event-sequence-tests
Coordinator event order test suite
- Assert lifecycle event ordering
- Validate payload shape per event
- Catch regressions in orchestration

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
