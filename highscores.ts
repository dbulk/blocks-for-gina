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
    entries.push(this.sanitizeEntry(entry));
    entries.sort((a, b) => this.compareEntries(a, b));
    const topEntries = entries.slice(0, this.maxEntries);

    const rank = topEntries.findIndex((current) => this.isSameEntry(current, entry));
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
        .map((item) => this.sanitizeEntry(item))
        .sort((a, b) => this.compareEntries(a, b))
        .slice(0, this.maxEntries);
    } catch {
      return [];
    }
  }

  private writeEntries (entries: HighScoreEntry[]): void {
    globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(entries));
  }

  private sanitizeEntry (entry: unknown): HighScoreEntry {
    if (typeof entry !== 'object' || entry === null) {
      return { score: 0, elapsedSeconds: 0, rows: 0, columns: 0, playedAt: Date.now() };
    }
    const source = entry as Partial<HighScoreEntry>;
    return {
      score: this.sanitizeNumber(source.score, 0),
      elapsedSeconds: this.sanitizeNumber(source.elapsedSeconds, 0),
      rows: this.sanitizeNumber(source.rows, 0),
      columns: this.sanitizeNumber(source.columns, 0),
      playedAt: this.sanitizeNumber(source.playedAt, Date.now())
    };
  }

  private sanitizeNumber (value: unknown, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }
    return value;
  }

  private compareEntries (a: HighScoreEntry, b: HighScoreEntry): number {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.elapsedSeconds !== b.elapsedSeconds) {
      return a.elapsedSeconds - b.elapsedSeconds;
    }
    return b.playedAt - a.playedAt;
  }

  private isSameEntry (a: HighScoreEntry, b: HighScoreEntry): boolean {
    return (
      a.score === b.score &&
      a.elapsedSeconds === b.elapsedSeconds &&
      a.rows === b.rows &&
      a.columns === b.columns &&
      a.playedAt === b.playedAt
    );
  }
}

export default LocalHighScores;
export type { HighScoreEntry, HighScoreRecordResult };
