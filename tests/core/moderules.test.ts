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
  it('uses no-more-moves for classic mode', () => {
    const state = makeState(0, 0);
    expect(shouldEndGameForMode('classic', state as never, false)).toBe(true);
    expect(shouldEndGameForMode('classic', state as never, true)).toBe(false);
  });

  it('ends timed mode at or after time limit', () => {
    expect(shouldEndGameForMode('timed', makeState(179, 0) as never, true)).toBe(false);
    expect(shouldEndGameForMode('timed', makeState(180, 0) as never, true)).toBe(true);
  });

  it('ends move-limited mode when move budget is exhausted', () => {
    expect(shouldEndGameForMode('move-limited', makeState(0, 29) as never, true)).toBe(false);
    expect(shouldEndGameForMode('move-limited', makeState(0, 30) as never, true)).toBe(true);
  });
});
