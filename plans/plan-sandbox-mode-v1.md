# Plan #sandbox-mode-v1

Goal: complete sandbox mode v1 by making sandbox block count fully functional and stable.

## Concrete steps
1. Define sandbox block-type constraints and defaults.
- Introduce a single source of truth for sandbox min/max block types.
- Set a practical max that avoids visual/render instability while allowing variety.

2. Make color support scale with block-type count.
- Expand default color palette to cover the sandbox max.
- Ensure preferences always provide at least `numBlockTypes` colors.

3. Decouple renderer capacity from fixed color-input count.
- Ensure renderer can create/use enough offscreen canvases for current block-type count.
- Prevent undefined canvas/color access when `numBlockTypes` exceeds legacy defaults.

4. Wire sandbox setup block count through to active color configuration.
- On sandbox start, apply setup `numBlockTypes` and sync active color count.
- Keep existing behavior for non-sandbox modes.

5. Validate via tests and build.
- Add/adjust tests for dynamic color count + sandbox block count behavior.
- Run full test suite and production build.

## Expected commits
1. `plan: expand sandbox mode v1 steps`
2. `feat: add scalable block color defaults`
3. `fix: support sandbox block count in renderer`
4. `test: cover sandbox block count color wiring`

## Relevant files
- `src/presentation/sandboxsetupview.ts`
- `src/bootstrap/blocks-4-gina.ts`
- `src/core/userpreferences.ts`
- `src/core/gamecoordinator.ts`
- `src/presentation/uinodes.ts`
- `src/rendering/renderer.ts`
- `tests/core/gamecoordinator.event-sequence.test.ts`
- `tests/presentation/*` and `tests/core/*` as needed

## Verification
1. `npm test`
2. `npm run build`
3. Manual check: sandbox block count 2, 5, and max each generate distinct block variety without rendering issues.
