import { describe, expect, it, vi } from 'vitest';
import GameEventBus from '@/events/eventbus';

describe('GameEventBus', () => {
  it('emits to listeners for a matching event type', () => {
    const bus = new GameEventBus();
    const listener = vi.fn();

    bus.on('gameStarted', listener);
    bus.emit('gameStarted', {
      type: 'gameStarted',
      rows: 10,
      columns: 20,
      blockTypes: 5
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can unsubscribe a listener', () => {
    const bus = new GameEventBus();
    const listener = vi.fn();

    const unsubscribe = bus.on('gameEnded', listener);
    unsubscribe();

    bus.emit('gameEnded', {
      type: 'gameEnded',
      score: 120,
      playedSeconds: 77,
      blocksPopped: 10,
      largestCluster: 4
    });

    expect(listener).not.toHaveBeenCalled();
  });
});
