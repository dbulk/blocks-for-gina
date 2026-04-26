# Plan: #defects

## Goal
Fix the defect where "Resume Timed" can appear after a timed game is already complete.

## Implementation

1. Harden resume eligibility in `SessionStorage` so timed snapshots are resumable only when:
- elapsed time is below timed duration, and
- there is at least one available move in the serialized grid.

2. Keep existing mode-id compatibility mappings (`zen` -> `infinite`, `arcade` -> `classic`).

3. Add regression tests in `tests/persistence/sessionstorage.test.ts`:
- completed timed by elapsed time should not resume,
- timed with no moves should not resume,
- timed with remaining time and moves should resume.

4. Verify with `npm test`.
