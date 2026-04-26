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

  it('stores competitive entries independently per mode', () => {
    const scores = new LocalHighScores('ranked-mode-test', 10);
    scores.record({ score: 140, elapsedSeconds: 70, rows: 10, columns: 20, playedAt: 1 }, 'classic');
    scores.record({ score: 220, elapsedSeconds: 55, rows: 10, columns: 20, playedAt: 2 }, 'timed');

    expect(scores.getTopEntries('classic').map((entry) => entry.score)).toEqual([140]);
    expect(scores.getTopEntries('timed').map((entry) => entry.score)).toEqual([220]);
  });

  it('migrates legacy global list storage into classic bucket', () => {
    const legacyEntries = [
      { score: 150, elapsedSeconds: 90, rows: 10, columns: 20, playedAt: 1 },
      { score: 120, elapsedSeconds: 80, rows: 10, columns: 20, playedAt: 2 }
    ];
    globalThis.localStorage?.setItem('legacy-migrate-test', JSON.stringify(legacyEntries));

    const scores = new LocalHighScores('legacy-migrate-test', 10);

    expect(scores.getTopEntries('classic').map((entry) => entry.score)).toEqual([150, 120]);
    expect(scores.getTopEntries('timed')).toEqual([]);

    const persisted = JSON.parse(globalThis.localStorage?.getItem('legacy-migrate-test') ?? '{}') as Record<string, unknown>;
    expect(Array.isArray(persisted.classic)).toBe(true);
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