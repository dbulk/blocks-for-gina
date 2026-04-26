# Test Bed Assessment

Date: 2026-04-26

## Current Balance

- Test files: 18
- Test cases: 104
- Distribution by top-level area:
  - architecture: 1 file
  - bootstrap: 1 file
  - core: 6 files
  - events: 1 file
  - persistence: 2 files
  - presentation: 7 files

Overall, coverage is good for product behavior and mode flows. The test bed is strongest in unit-level core/presentation behavior and weaker in architecture-policy depth.

## Under-Testing

1. Architecture boundary breadth
- Previously only validated core->presentation imports for non-exception core files.
- Missing checks for additional forbidden layer imports (rendering/bootstrap) in domain files.

Adjustment made:
- Expanded architecture boundary test to enforce broader forbidden imports for core modules.
- File updated: tests/architecture/boundaries.test.ts

2. Resume eligibility edge behavior at persistence boundary
- Timed resume correctness can regress without direct state-shape checks.

Adjustment made:
- Added timed resume eligibility tests (completed by elapsed time, no moves, valid resumable timed snapshot).
- File updated: tests/persistence/sessionstorage.test.ts

## Potential Over-Testing

1. Repeated literal mode id assertions across multiple suites
- Some tests validate identical mode-id literals in many files.
- Maintenance cost rises on nomenclature changes (e.g., arcade->classic).

Recommendation:
- Introduce lightweight shared constants for canonical mode ids in tests only.
- Keep end-to-end user-facing label assertions in a smaller number of presentation tests.

2. Snapshot-shape details duplicated in several integration fixtures
- Repeated fixture object scaffolding makes tests noisy.

Recommendation:
- Create test-only fixture builders for run context and minimal session snapshots.

## Confidence vs Maintenance Guidance

- Keep:
  - event-sequence tests in core/gamecoordinator
  - mode-specific unit tests in core/presentation
  - architecture boundary guards

- Avoid expanding:
  - brittle style/layout assertions
  - duplicate mode-id checks that add no behavioral signal

## Next Test Improvements (Low-Risk)

1. Add one smoke test that validates end-to-end resume visibility using a real SessionStorage snapshot shape.
2. Add a compact helper module for shared test fixtures and mode ids.
3. Keep CI gates unchanged: test + build must pass for each backlog branch.
