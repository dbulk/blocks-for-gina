import { describe, expect, it } from 'vitest';
import ModeRegistry, { createDefaultModeRegistry } from '@/core/moderegistry';

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
    expect(registry.get('sprint')?.implemented).toBe(true);
    expect(registry.get('antigravity')).not.toBeNull();
  });
});
