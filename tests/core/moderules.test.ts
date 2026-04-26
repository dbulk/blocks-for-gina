import { describe, expect, it } from 'vitest';
import { registerModeEndRuleHook, shouldEndGameForMode } from '@/core/moderules';

type PlayedDuration = { hours: number, minutes: number, seconds: number };

type FakeGameState = {
  getPlayedDuration: () => PlayedDuration
  getTotalMoves: () => number
  getPrecisionStrikes: () => number
};

const makeState = (seconds: number, moves: number, precisionStrikes: number = 0): FakeGameState => ({
  getPlayedDuration: () => ({ hours: 0, minutes: Math.floor(seconds / 60), seconds: seconds % 60 }),
  getTotalMoves: () => moves,
  getPrecisionStrikes: () => precisionStrikes
});

describe('mode rules', () => {
  it('uses no-more-moves for arcade mode', () => {
    const state = makeState(0, 0);
    expect(shouldEndGameForMode('arcade', state as never, false)).toBe(true);
    expect(shouldEndGameForMode('arcade', state as never, true)).toBe(false);
  });

  it('ends timed mode at or after time limit', () => {
    expect(shouldEndGameForMode('timed', makeState(59, 0) as never, true)).toBe(false);
    expect(shouldEndGameForMode('timed', makeState(60, 0) as never, true)).toBe(true);
  });

  it('ends sprint mode when move budget is exhausted', () => {
    expect(shouldEndGameForMode('sprint', makeState(0, 9) as never, true)).toBe(false);
    expect(shouldEndGameForMode('sprint', makeState(0, 10) as never, true)).toBe(true);
  });

  it('supports custom mode end-rule hooks', () => {
    registerModeEndRuleHook('custom', (gameState) => gameState.getTotalMoves() >= 2);

    expect(shouldEndGameForMode('custom', makeState(0, 1) as never, true)).toBe(false);
    expect(shouldEndGameForMode('custom', makeState(0, 2) as never, true)).toBe(true);
  });

  it('never ends infinite mode by timer or move exhaustion', () => {
    expect(shouldEndGameForMode('infinite', makeState(0, 999) as never, false)).toBe(false);
    expect(shouldEndGameForMode('infinite', makeState(9999, 999) as never, true)).toBe(false);
  });

  it('ends precision mode at three strikes', () => {
    expect(shouldEndGameForMode('precision', makeState(0, 0, 2) as never, true)).toBe(false);
    expect(shouldEndGameForMode('precision', makeState(0, 0, 3) as never, true)).toBe(true);
  });
});
