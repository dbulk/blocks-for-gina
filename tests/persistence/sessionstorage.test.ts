import { beforeEach, describe, expect, it } from 'vitest';
import SessionStorage from '@/persistence/sessionstorage';

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
    sessionStorage.save({ score: 10 }, { rows: 10 });

    const snapshot = sessionStorage.load();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.version).toBe(1);
    expect(snapshot?.state).toEqual({ score: 10 });
    expect(snapshot?.settings).toEqual({ rows: 10 });
  });

  it('returns null for malformed payloads', () => {
    const sessionStorage = new SessionStorage('test-key');
    localStorage.setItem('test-key', '{bad-json}');
    expect(sessionStorage.load()).toBeNull();
  });
});
