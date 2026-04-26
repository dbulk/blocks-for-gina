interface SessionSnapshot {
  version: number
  state: unknown
  settings: unknown
}

const CURRENT_SESSION_VERSION = 2;
const TIMED_MODE_DURATION_SECONDS = 60;

class SessionStorage {
  private readonly storageKey: string;

  constructor (storageKey: string = 'b4g') {
    this.storageKey = storageKey;
  }

  save (state: unknown, settings: unknown): void {
    const snapshot: SessionSnapshot = {
      version: CURRENT_SESSION_VERSION,
      state,
      settings
    };

    localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
  }

  load (): SessionSnapshot | null {
    const raw = localStorage.getItem(this.storageKey);
    if (raw === null) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!this.isSessionSnapshot(parsed)) {
      return null;
    }

    if (parsed.version !== CURRENT_SESSION_VERSION) {
      return null;
    }

    return parsed;
  }

  private isSessionSnapshot (value: unknown): value is SessionSnapshot {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<SessionSnapshot>;
    return (
      typeof candidate.version === 'number' &&
      'state' in candidate &&
      'settings' in candidate
    );
  }

  clear (): void {
    localStorage.removeItem(this.storageKey);
  }

  hasSavedGame (): boolean {
    const snapshot = this.load();
    if (snapshot === null) {
      return false;
    }

    return this.getEligibleModeId(snapshot) !== null;
  }

  getSavedModeId (): string | null {
    const snapshot = this.load();
    if (snapshot === null) return null;

    return this.getEligibleModeId(snapshot);
  }

  private getEligibleModeId (snapshot: SessionSnapshot): string | null {
    const settings = snapshot.settings as Record<string, unknown>;
    if (typeof settings?.modeId !== 'string') {
      return null;
    }

    const normalizedModeId = this.normalizeModeId(settings.modeId);
    if (normalizedModeId !== 'timed') {
      return normalizedModeId;
    }

    const state = snapshot.state as Record<string, unknown>;
    const serializedDuration = typeof state?.serializedGameDuration === 'number'
      ? state.serializedGameDuration
      : 0;
    if (serializedDuration >= TIMED_MODE_DURATION_SECONDS * 1000) {
      return null;
    }

    const hasMoves = this.hasMoreMovesInGrid(state?.griddata);
    if (hasMoves === false) {
      return null;
    }

    return normalizedModeId;
  }

  private normalizeModeId (modeId: string): string {
    if (modeId === 'zen') {
      return 'infinite';
    }
    if (modeId === 'arcade') {
      return 'classic';
    }
    return modeId;
  }

  private hasMoreMovesInGrid (gridData: unknown): boolean | null {
    if (!Array.isArray(gridData) || gridData.length === 0) {
      return null;
    }

    for (let row = 0; row < gridData.length; row++) {
      const currentRow = gridData[row];
      if (!Array.isArray(currentRow)) {
        return null;
      }

      for (let col = 0; col < currentRow.length; col++) {
        const id = currentRow[col];
        if (typeof id !== 'number') {
          continue;
        }

        const right = col + 1 < currentRow.length ? currentRow[col + 1] : undefined;
        if (right === id) {
          return true;
        }

        const belowRow = row + 1 < gridData.length ? gridData[row + 1] : undefined;
        const below = Array.isArray(belowRow) ? belowRow[col] : undefined;
        if (below === id) {
          return true;
        }
      }
    }

    return false;
  }
}

export default SessionStorage;
export type { SessionSnapshot };
