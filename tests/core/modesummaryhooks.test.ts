import { beforeEach, describe, expect, it } from 'vitest';
import { getModeSummaryHooks, registerModeSummaryHooks, resetModeSummaryHooks } from '@/core/modesummaryhooks';

describe('mode summary hooks', () => {
  beforeEach(() => {
    resetModeSummaryHooks();
  });

  it('provides timed defaults for title and hidden blocks remaining', () => {
    const hooks = getModeSummaryHooks('timed');
    expect(hooks.title).toBe("Time's Up!");
    expect(hooks.hideBlocksRemaining).toBe(true);
  });

  it('provides sprint move formatter with budget display', () => {
    const hooks = getModeSummaryHooks('sprint');
    expect(hooks.formatMoves(7)).toBe('7/10');
  });

  it('supports custom mode summary hook overrides', () => {
    registerModeSummaryHooks('custom', {
      title: 'Custom Complete',
      hideBlocksRemaining: true,
      formatMoves: (moves) => `used:${moves}`
    });

    const hooks = getModeSummaryHooks('custom');
    expect(hooks.title).toBe('Custom Complete');
    expect(hooks.hideBlocksRemaining).toBe(true);
    expect(hooks.formatMoves(3)).toBe('used:3');
  });
});
