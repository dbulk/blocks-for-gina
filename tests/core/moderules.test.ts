import { describe, expect, it } from 'vitest';
import { shouldEndGameForMode } from '@/core/moderules';

type PlayedDuration = { hours: number, minutes: number, seconds: number };

type FakeGameState = {
  getPlayedDuration: () => PlayedDuration
  getTotalMoves: () => number
};

const makeState = (seconds: number, moves: number): FakeGameState => ({
  getPlayedDuration: () => ({ hours: 0, minutes: Math.floor(seconds / 60), seconds: seconds % 60 }),
  getTotalMoves: () => moves
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
    expect(shouldEndGameForMode('sprint', makeState(0, 29) as never, true)).toBe(false);
    expect(shouldEndGameForMode('sprint', makeState(0, 30) as never, true)).toBe(true);
  });
});
