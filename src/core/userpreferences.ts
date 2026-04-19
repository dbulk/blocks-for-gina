import { DEFAULT_BLOCK_STYLE, isBlockStyle, type BlockStyle } from '@/rendering/blockstyle';

const PREFS_STORAGE_KEY = 'b4g_prefs_v1';

const DEFAULT_BLOCK_COLORS = ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'];

interface PreferencesPayload {
  isMusicEnabled: boolean
  isSoundEnabled: boolean
  blockStyle: BlockStyle
  blockColors: string[]
}

class UserPreferences {
  isMusicEnabled: boolean = true;
  isSoundEnabled: boolean = true;
  blockStyle: BlockStyle = DEFAULT_BLOCK_STYLE;
  blockColors: string[] = [...DEFAULT_BLOCK_COLORS];

  constructor () {
    this.load();
  }

  save (): void {
    const payload: PreferencesPayload = {
      isMusicEnabled: this.isMusicEnabled,
      isSoundEnabled: this.isSoundEnabled,
      blockStyle: this.blockStyle,
      blockColors: this.blockColors
    };
    globalThis.localStorage?.setItem(PREFS_STORAGE_KEY, JSON.stringify(payload));
  }

  load (): void {
    const raw = globalThis.localStorage?.getItem(PREFS_STORAGE_KEY);
    if (raw === null || raw === undefined) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!this.isPreferencesPayload(parsed)) {
      return;
    }

    this.isMusicEnabled = parsed.isMusicEnabled;
    this.isSoundEnabled = parsed.isSoundEnabled;
    this.blockStyle = parsed.blockStyle;
    this.blockColors = parsed.blockColors;
  }

  resetToDefaults (): void {
    this.isMusicEnabled = true;
    this.isSoundEnabled = true;
    this.blockStyle = DEFAULT_BLOCK_STYLE;
    this.blockColors = [...DEFAULT_BLOCK_COLORS];
    this.save();
  }

  private isPreferencesPayload (value: unknown): value is PreferencesPayload {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const c = value as Partial<PreferencesPayload>;
    return (
      typeof c.isMusicEnabled === 'boolean' &&
      typeof c.isSoundEnabled === 'boolean' &&
      typeof c.blockStyle === 'string' && isBlockStyle(c.blockStyle) &&
      Array.isArray(c.blockColors) && c.blockColors.every(v => typeof v === 'string')
    );
  }
}

export default UserPreferences;
export type { PreferencesPayload };
