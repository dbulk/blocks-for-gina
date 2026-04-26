import { beforeEach, describe, expect, it } from 'vitest';
import SessionStorage from '@/persistence/sessionstorage';

const makeStateSnapshot = (overrides: Record<string, unknown> = {}) => ({
  griddata: [[1, 1], [2, 3]],
  score: 10,
  serializedGameDuration: 1000,
  ...overrides
});

const makeSettingsSnapshot = (overrides: Record<string, unknown> = {}) => ({
  numColumns: 20,
  numRows: 10,
  numBlockTypes: 5,
  clusterStrength: 0.2,
  modeId: 'classic',
  ...overrides
});

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

describe('SessionStorage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true
    });
  });

  it('persists and loads versioned session snapshots', () => {
    const sessionStorage = new SessionStorage('test-key');
    sessionStorage.save(makeStateSnapshot(), makeSettingsSnapshot());

    const snapshot = sessionStorage.load();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.version).toBe(2);
    expect(snapshot?.state).toEqual(makeStateSnapshot());
    expect(snapshot?.settings).toEqual(makeSettingsSnapshot());
  });

  it('returns null for malformed payloads', () => {
    const sessionStorage = new SessionStorage('test-key');
    localStorage.setItem('test-key', '{bad-json}');
    expect(sessionStorage.load()).toBeNull();
  });

  it('maps legacy zen mode id to infinite for resume compatibility', () => {
    const sessionStorage = new SessionStorage('test-key');
    localStorage.setItem('test-key', JSON.stringify({
      version: 2,
      state: makeStateSnapshot(),
      settings: makeSettingsSnapshot({ modeId: 'zen' })
    }));

    expect(sessionStorage.getSavedModeId()).toBe('infinite');
  });

  it('does not show resume for completed timed sessions by elapsed time', () => {
    const sessionStorage = new SessionStorage('test-key');
    sessionStorage.save(
      makeStateSnapshot({ serializedGameDuration: 60000 }),
      makeSettingsSnapshot({ modeId: 'timed' })
    );

    expect(sessionStorage.hasSavedGame()).toBe(false);
    expect(sessionStorage.getSavedModeId()).toBeNull();
  });

  it('does not show resume for timed sessions with no available moves', () => {
    const sessionStorage = new SessionStorage('test-key');
    sessionStorage.save(
      makeStateSnapshot({ griddata: [[0, 1], [2, 3]] }),
      makeSettingsSnapshot({ modeId: 'timed' })
    );

    expect(sessionStorage.hasSavedGame()).toBe(false);
    expect(sessionStorage.getSavedModeId()).toBeNull();
  });

  it('keeps resume for timed sessions that still have time and moves', () => {
    const sessionStorage = new SessionStorage('test-key');
    sessionStorage.save(
      makeStateSnapshot({ griddata: [[0, 0], [2, 3]] }),
      makeSettingsSnapshot({ modeId: 'timed' })
    );

    expect(sessionStorage.hasSavedGame()).toBe(true);
    expect(sessionStorage.getSavedModeId()).toBe('timed');
  });
});
