import { describe, expect, it } from 'vitest';
import ModeRegistry, { createDefaultModeRegistry, isCompetitiveMode } from '@/core/moderegistry';

describe('ModeRegistry', () => {
  it('registers and retrieves modes', () => {
    const registry = new ModeRegistry();
    registry.register({ id: 'classic', name: 'Classic', description: 'Default mode' });

    expect(registry.get('classic')?.name).toBe('Classic');
    expect(registry.list()).toHaveLength(1);
  });

  it('rejects duplicate mode ids', () => {
    const registry = new ModeRegistry();
    registry.register({ id: 'classic', name: 'Classic', description: 'Default mode' });

    expect(() => {
      registry.register({ id: 'classic', name: 'Classic Again', description: 'Duplicate' });
    }).toThrowError('Invalid mode registration (id): must be unique (mode already registered); received="classic"; modeId="classic"');
  });

  it('provides a default mode catalog', () => {
    const registry = createDefaultModeRegistry();
    expect(registry.get('classic')).not.toBeNull();
    expect(registry.get('timed')).not.toBeNull();
    expect(registry.get('sprint')).not.toBeNull();
    expect(registry.get('cascade')).not.toBeNull();
    expect(registry.get('precision')).not.toBeNull();
    expect(registry.get('infinite')).not.toBeNull();
    expect(registry.get('sprint')?.implemented).toBe(true);
    expect(registry.get('cascade')?.implemented).toBe(true);
    expect(registry.get('precision')?.implemented).toBe(true);
    expect(registry.get('antigravity')).not.toBeNull();
    expect(registry.get('antigravity')?.implemented).toBe(true);
  });

  it('defaults competitive and implemented flags when omitted', () => {
    const registry = new ModeRegistry();
    registry.register({ id: 'custom', name: 'Custom', description: 'Custom mode' });

    expect(registry.get('custom')).toMatchObject({ implemented: false, competitive: true });
  });

  it('rejects blank registration fields', () => {
    const registry = new ModeRegistry();
    expect(() => registry.register({ id: '   ', name: 'Bad', description: 'Bad mode' })).toThrowError('Invalid mode registration (id): must be a non-empty string; received="   "');
    expect(() => registry.register({ id: 'bad1', name: '   ', description: 'Bad mode' })).toThrowError('Invalid mode registration (name): must be a non-empty string; received="   "; modeId="bad1"');
    expect(() => registry.register({ id: 'bad2', name: 'Bad', description: '   ' })).toThrowError('Invalid mode registration (description): must be a non-empty string; received="   "; modeId="bad2"');
  });

  it('rejects non-boolean optional flags with field context', () => {
    const registry = new ModeRegistry();

    expect(() => registry.register({
      id: 'bad3',
      name: 'Bad',
      description: 'Bad mode',
      implemented: 'yes' as unknown as boolean
    })).toThrowError('Invalid mode registration (implemented): must be a boolean when provided; received="yes"; modeId="bad3"');

    expect(() => registry.register({
      id: 'bad4',
      name: 'Bad',
      description: 'Bad mode',
      competitive: 1 as unknown as boolean
    })).toThrowError('Invalid mode registration (competitive): must be a boolean when provided; received=1; modeId="bad4"');
  });

  it('uses mode metadata for competitiveness checks', () => {
    expect(isCompetitiveMode('sandbox')).toBe(false);
    expect(isCompetitiveMode('infinite')).toBe(false);
    expect(isCompetitiveMode('classic')).toBe(true);
  });
});
