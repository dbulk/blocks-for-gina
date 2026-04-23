# Plan #sandbox-score-policy

Goal: Keep Sandbox non-competitive while preserving personal feedback.

## Concrete steps
1. Introduce an explicit score-policy decision point keyed by mode id.
- Add a small mode policy helper or registry-owned helper that answers whether a mode is competitive.
- Keep the first cut narrow: `sandbox` is non-competitive, current shipped ranked modes remain competitive.

2. Gate ranked leaderboard writes behind that policy in the game-over path.
- Update `GameCoordinator` so sandbox runs do not call the ranked `LocalHighScores.record(...)` path.
- Preserve existing game-over summary metrics and event emission for all modes.

3. Add sandbox-local personal best persistence.
- Extend persistence with a separate sandbox-best record keyed independently from ranked highscores.
- Store enough run data to render useful feedback: score, elapsed seconds, rows, columns, and playedAt.
- Keep it single-entry / best-only rather than a ranked list.

4. Render sandbox summary without ranked language.
- Update the game-over overlay so competitive modes still show `High Scores` and rank, while sandbox shows a sandbox-specific summary block.
- Sandbox copy should avoid rank language and instead show current run plus personal best when available.

5. Cover the policy with tests.
- Add persistence tests for sandbox personal-best update behavior.
- Add coordinator tests proving sandbox skips ranked writes and competitive modes still record ranked entries.
- Add presentation tests for sandbox summary rendering versus competitive leaderboard rendering.

## Expected commits
1. `feat: add score policy by mode`
2. `refactor: gate ranked highscores for sandbox`
3. `feat: add sandbox personal best persistence`
4. `feat: render sandbox personal best summary`
5. `test: cover sandbox score policy`

## Relevant files
- `src/core/gamecoordinator.ts` - current game-over write path and summary payload assembly.
- `src/persistence/highscores.ts` - ranked high-score persistence surface to keep intact for competitive modes.
- `src/presentation/gameoveroverlayview.ts` - current summary rendering that assumes ranked highscores.
- `src/presentation/htmlinterface.ts` - summary method surface if payload shape needs to widen.
- `src/core/moderegistry.ts` or a nearby helper - natural home for competitive-mode policy.
- `tests/core/gamecoordinator.event-sequence.test.ts` - likely coordinator regression anchor.
- `tests/presentation/gameoveroverlayview.test.ts` - summary rendering regression anchor.

## Verification
1. `npm test`
2. `npm run build`
3. Manual check: finish an arcade run and confirm ranked leaderboard still updates.
4. Manual check: finish a sandbox run and confirm no rank is shown, but sandbox personal best feedback is shown.
