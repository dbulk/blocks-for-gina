# Plan: #arch-hygiene

## Goal
Complete the final backlog item by producing:
- hygeine-report.md: deep code-hygiene analysis
- archplan.md: architecture strengthening plan
- testbed.md: under/over-testing evaluation + practical adjustments

## Steps

1. Gather current architecture and test surface facts:
- Module boundaries, coupling hotspots, and naming/config consistency.
- Test distribution by layer and notable blind spots.

2. Produce artifacts:
- `hygeine-report.md` with categorized findings (severity, impact, actionable remediations).
- `archplan.md` with prioritized, phased architecture improvements and success criteria.
- `testbed.md` with confidence-vs-maintenance analysis and proposed test portfolio shape.

3. Apply targeted test-bed adjustment:
- Add at least one focused regression/integration test that addresses a currently under-tested behavior with high user impact.

4. Verify:
- Run `npm test`.
- Keep scope limited to this backlog item and avoid broad refactors.
