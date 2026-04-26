const TIMED_MODE_DURATION_SECONDS = 60;

import type { GameStateSnapshot } from '@/core/gamestate';
import type { GameSettingsSnapshot } from '@/core/gamesettings';
import { createSessionSnapshot, normalizePersistedModeId, translateStoredSessionSnapshot, type SessionSnapshot } from '@/persistence/sessionsnapshot';

class SessionStorage {
  private readonly storageKey: string;

  constructor (storageKey: string = 'b4g') {
    this.storageKey = storageKey;
  }

  save (state: GameStateSnapshot, settings: GameSettingsSnapshot): void {
    const snapshot = createSessionSnapshot(state, settings);
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

    return translateStoredSessionSnapshot(parsed);
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
    if (typeof snapshot.settings.modeId !== 'string') {
      return null;
    }

    const normalizedModeId = normalizePersistedModeId(snapshot.settings.modeId);
    if (normalizedModeId !== 'timed') {
      return normalizedModeId;
    }

    const serializedDuration = snapshot.state.serializedGameDuration;
    if (serializedDuration >= TIMED_MODE_DURATION_SECONDS * 1000) {
      return null;
    }

    const hasMoves = this.hasMoreMovesInGrid(snapshot.state.griddata);
    if (hasMoves === false) {
      return null;
    }

    return normalizedModeId;
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
