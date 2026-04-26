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
    }).toThrowError('Mode already registered: classic');
  });

  it('provides a default mode catalog', () => {
    const registry = createDefaultModeRegistry();
    expect(registry.get('arcade')).not.toBeNull();
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
    expect(() => registry.register({ id: '   ', name: 'Bad', description: 'Bad mode' })).toThrowError('Mode id is required');
    expect(() => registry.register({ id: 'bad1', name: '   ', description: 'Bad mode' })).toThrowError('Mode name is required: bad1');
    expect(() => registry.register({ id: 'bad2', name: 'Bad', description: '   ' })).toThrowError('Mode description is required: bad2');
  });

  it('uses mode metadata for competitiveness checks', () => {
    expect(isCompetitiveMode('sandbox')).toBe(false);
    expect(isCompetitiveMode('infinite')).toBe(false);
    expect(isCompetitiveMode('arcade')).toBe(true);
  });
});
