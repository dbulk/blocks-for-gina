import { beforeEach, describe, expect, it } from 'vitest';
import LocalHighScores, { LocalSandboxBest } from '@/persistence/highscores';

class LocalStorageMock implements Storage {
  private store = new Map<string, string>();
  get length (): number {
    return this.store.size;
  }

  clear (): void {
    this.store.clear();
  }

  getItem (key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key (index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem (key: string): void {
    this.store.delete(key);
  }

  setItem (key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('high score persistence', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true
    });
  });

  it('keeps ranked scores ordered by score then faster time', () => {
    const scores = new LocalHighScores('ranked-test', 10);
    scores.record({ score: 100, elapsedSeconds: 90, rows: 10, columns: 20, playedAt: 1 });
    scores.record({ score: 100, elapsedSeconds: 80, rows: 10, columns: 20, playedAt: 2 });

    expect(scores.getTopEntries().map((entry) => entry.elapsedSeconds)).toEqual([80, 90]);
  });

  it('stores sandbox personal best separately and only replaces it with a better run', () => {
    const sandboxBest = new LocalSandboxBest('sandbox-best-test');

    const first = sandboxBest.record({ score: 120, elapsedSeconds: 75, rows: 8, columns: 12, playedAt: 1 });
    const worse = sandboxBest.record({ score: 110, elapsedSeconds: 60, rows: 8, columns: 12, playedAt: 2 });
    const better = sandboxBest.record({ score: 140, elapsedSeconds: 95, rows: 9, columns: 14, playedAt: 3 });

    expect(first.isNewBest).toBe(true);
    expect(worse.isNewBest).toBe(false);
    expect(worse.bestEntry?.score).toBe(120);
    expect(better.isNewBest).toBe(true);
    expect(better.bestEntry?.score).toBe(140);
    expect(sandboxBest.getBest()?.rows).toBe(9);
  });
});