import { DEFAULT_BLOCK_STYLE, isBlockStyle, type BlockStyle } from '@/rendering/blockstyle';
import { SANDBOX_MAX_BLOCK_TYPES } from '@/core/sandboxconstraints';

const PREFS_STORAGE_KEY = 'b4g_prefs_v1';

const DEFAULT_BLOCK_COLORS = ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2', '#F4A259', '#2EC4B6', '#E71D36', '#3A86FF', '#FFBE0B'];

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
    this.ensureBlockColorCapacity(SANDBOX_MAX_BLOCK_TYPES);
  }

  resetToDefaults (): void {
    this.isMusicEnabled = true;
    this.isSoundEnabled = true;
    this.blockStyle = DEFAULT_BLOCK_STYLE;
    this.blockColors = [...DEFAULT_BLOCK_COLORS];
    this.save();
  }

  ensureBlockColorCapacity (requiredCount: number): void {
    const target = Math.max(1, Math.round(requiredCount));
    while (this.blockColors.length < target) {
      const i = this.blockColors.length;
      const fallback = DEFAULT_BLOCK_COLORS[i] ?? this.generateColorFromIndex(i);
      this.blockColors.push(fallback);
    }
  }

  private generateColorFromIndex (index: number): string {
    const hue = (index * 47) % 360;
    const sat = 72;
    const light = 58;
    return this.hslToHex(hue, sat, light);
  }

  private hslToHex (h: number, s: number, l: number): string {
    const sat = s / 100;
    const light = l / 100;
    const k = (n: number): number => (n + h / 30) % 12;
    const a = sat * Math.min(light, 1 - light);
    const f = (n: number): number => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number): string => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
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
export { DEFAULT_BLOCK_COLORS };
export type { PreferencesPayload };
