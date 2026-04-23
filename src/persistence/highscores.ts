interface HighScoreEntry {
  score: number
  elapsedSeconds: number
  rows: number
  columns: number
  playedAt: number
}

interface HighScoreRecordResult {
  rank: number | null
  topEntries: HighScoreEntry[]
}

interface SandboxBestRecordResult {
  bestEntry: HighScoreEntry | null
  isNewBest: boolean
}

const sanitizeNumber = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
};

const sanitizeEntry = (entry: unknown): HighScoreEntry => {
  if (typeof entry !== 'object' || entry === null) {
    return { score: 0, elapsedSeconds: 0, rows: 0, columns: 0, playedAt: Date.now() };
  }
  const source = entry as Partial<HighScoreEntry>;
  return {
    score: sanitizeNumber(source.score, 0),
    elapsedSeconds: sanitizeNumber(source.elapsedSeconds, 0),
    rows: sanitizeNumber(source.rows, 0),
    columns: sanitizeNumber(source.columns, 0),
    playedAt: sanitizeNumber(source.playedAt, Date.now())
  };
};

const compareEntries = (a: HighScoreEntry, b: HighScoreEntry): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  if (a.elapsedSeconds !== b.elapsedSeconds) {
    return a.elapsedSeconds - b.elapsedSeconds;
  }
  return b.playedAt - a.playedAt;
};

const isSameEntry = (a: HighScoreEntry, b: HighScoreEntry): boolean => (
  a.score === b.score &&
  a.elapsedSeconds === b.elapsedSeconds &&
  a.rows === b.rows &&
  a.columns === b.columns &&
  a.playedAt === b.playedAt
);

class LocalHighScores {
  private readonly storageKey: string;
  private readonly maxEntries: number;

  constructor (storageKey: string = 'b4g_highscores_v1', maxEntries: number = 10) {
    this.storageKey = storageKey;
    this.maxEntries = maxEntries;
  }

  getTopEntries (): HighScoreEntry[] {
    return this.readEntries();
  }

  record (entry: HighScoreEntry): HighScoreRecordResult {
    const entries = this.readEntries();
    entries.push(sanitizeEntry(entry));
    entries.sort((a, b) => compareEntries(a, b));
    const topEntries = entries.slice(0, this.maxEntries);

    const rank = topEntries.findIndex((current) => isSameEntry(current, entry));
    this.writeEntries(topEntries);
    return { rank: rank >= 0 ? rank + 1 : null, topEntries };
  }

  private readEntries (): HighScoreEntry[] {
    const raw = globalThis.localStorage?.getItem(this.storageKey);
    if (raw === null || raw === undefined) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((item) => sanitizeEntry(item))
        .sort((a, b) => compareEntries(a, b))
        .slice(0, this.maxEntries);
    } catch {
      return [];
    }
  }

  private writeEntries (entries: HighScoreEntry[]): void {
    globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(entries));
  }
}

class LocalSandboxBest {
  private readonly storageKey: string;

  constructor (storageKey: string = 'b4g_sandbox_best_v1') {
    this.storageKey = storageKey;
  }

  getBest (): HighScoreEntry | null {
    const raw = globalThis.localStorage?.getItem(this.storageKey);
    if (raw === null || raw === undefined) {
      return null;
    }

    try {
      return sanitizeEntry(JSON.parse(raw) as unknown);
    } catch {
      return null;
    }
  }

  record (entry: HighScoreEntry): SandboxBestRecordResult {
    const sanitizedEntry = sanitizeEntry(entry);
    const currentBest = this.getBest();

    if (currentBest === null || compareEntries(sanitizedEntry, currentBest) < 0) {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(sanitizedEntry));
      return { bestEntry: sanitizedEntry, isNewBest: true };
    }

    return { bestEntry: currentBest, isNewBest: false };
  }
}

export default LocalHighScores;
export { LocalSandboxBest };
export type { HighScoreEntry, HighScoreRecordResult, SandboxBestRecordResult };
