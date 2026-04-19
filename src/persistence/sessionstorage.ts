interface SessionSnapshot {
  version: number
  state: unknown
  settings: unknown
}

const CURRENT_SESSION_VERSION = 2;

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
}

export default SessionStorage;
export type { SessionSnapshot };
