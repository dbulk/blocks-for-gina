import type { GameStateSnapshot } from '@/core/gamestate';
import type { GameSettingsSnapshot } from '@/core/gamesettings';

interface SessionSnapshot {
  version: number
  state: GameStateSnapshot
  settings: GameSettingsSnapshot
}

const CURRENT_SESSION_VERSION = 2;

const normalizePersistedModeId = (modeId: string): string => {
  if (modeId === 'zen') {
    return 'infinite';
  }
  if (modeId === 'arcade') {
    return 'classic';
  }
  return modeId;
};

const normalizeSessionSettings = (settings: GameSettingsSnapshot): GameSettingsSnapshot => ({
  ...settings,
  modeId: typeof settings.modeId === 'string' ? normalizePersistedModeId(settings.modeId) : settings.modeId
});

const createSessionSnapshot = (state: GameStateSnapshot, settings: GameSettingsSnapshot): SessionSnapshot => ({
  version: CURRENT_SESSION_VERSION,
  state,
  settings: normalizeSessionSettings(settings)
});

const isGameSettingsSnapshot = (value: unknown): value is GameSettingsSnapshot => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<GameSettingsSnapshot>;
  return (
    typeof candidate.numColumns === 'number' &&
    typeof candidate.numRows === 'number' &&
    typeof candidate.numBlockTypes === 'number' &&
    typeof candidate.clusterStrength === 'number' &&
    (candidate.modeId === undefined || typeof candidate.modeId === 'string')
  );
};

const isGameStateSnapshot = (value: unknown): value is GameStateSnapshot => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<GameStateSnapshot>;
  return Array.isArray(candidate.griddata) && typeof candidate.score === 'number' && typeof candidate.serializedGameDuration === 'number';
};

const isSessionSnapshot = (value: unknown): value is SessionSnapshot => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SessionSnapshot>;
  return (
    typeof candidate.version === 'number' &&
    isGameStateSnapshot(candidate.state) &&
    isGameSettingsSnapshot(candidate.settings)
  );
};

const translateStoredSessionSnapshot = (value: unknown): SessionSnapshot | null => {
  if (!isSessionSnapshot(value)) {
    return null;
  }

  if (value.version !== CURRENT_SESSION_VERSION) {
    return null;
  }

  return {
    version: value.version,
    state: value.state,
    settings: normalizeSessionSettings(value.settings)
  };
};

export { CURRENT_SESSION_VERSION, createSessionSnapshot, normalizePersistedModeId, translateStoredSessionSnapshot };
export type { SessionSnapshot };