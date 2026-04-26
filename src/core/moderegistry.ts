interface GameMode {
  id: string
  name: string
  description: string
  implemented: boolean
  competitive: boolean
}

interface ModeRegistration {
  id: string
  name: string
  description: string
  implemented?: boolean
  competitive?: boolean
}

const normalizeModeId = (modeId: string): string => modeId.trim();

class ModeRegistry {
  private readonly modes = new Map<string, GameMode>();

  register (mode: ModeRegistration): void {
    const id = normalizeModeId(mode.id);
    if (id === '') {
      throw new Error('Mode id is required');
    }
    if (mode.name.trim() === '') {
      throw new Error(`Mode name is required: ${id}`);
    }
    if (mode.description.trim() === '') {
      throw new Error(`Mode description is required: ${id}`);
    }
    if (this.modes.has(id)) {
      throw new Error(`Mode already registered: ${id}`);
    }

    this.modes.set(id, {
      id,
      name: mode.name,
      description: mode.description,
      implemented: mode.implemented ?? false,
      competitive: mode.competitive ?? true
    });
  }

  get (id: string): GameMode | null {
    return this.modes.get(id) ?? null;
  }

  list (): GameMode[] {
    return Array.from(this.modes.values());
  }
}

const createDefaultModeRegistry = (): ModeRegistry => {
  const registry = new ModeRegistry();
  registry.register({ id: 'arcade', name: 'Arcade', description: 'Play until there are no valid moves. Compare your best runs.', implemented: true, competitive: true });
  registry.register({ id: 'sandbox', name: 'Sandbox', description: 'Custom board size and generation. Explore freely.', implemented: true, competitive: false });
  registry.register({ id: 'timed', name: 'Timed', description: 'Score as much as possible before time runs out.', implemented: true, competitive: true });
  registry.register({ id: 'sprint', name: 'Sprint', description: 'Maximize score within a fixed move budget.', implemented: true, competitive: true });
  registry.register({ id: 'antigravity', name: 'Antigravity', description: 'Blocks float upward instead of falling. Clear from the top down.', implemented: false });
  registry.register({ id: 'cascade', name: 'Cascade', description: 'Every pop triggers a chain reaction. Combos are everything.', implemented: false });
  registry.register({ id: 'precision', name: 'Precision', description: 'Only pops of a minimum cluster size score. Think before you click.', implemented: false });
  registry.register({ id: 'zen', name: 'Zen', description: 'No pressure, no timer, no game over. Just pop blocks.', implemented: false });
  return registry;
};

const defaultModeRegistry = createDefaultModeRegistry();

const isCompetitiveMode = (modeId: string): boolean => defaultModeRegistry.get(modeId)?.competitive ?? true;

export default ModeRegistry;
export { createDefaultModeRegistry, isCompetitiveMode };
export type { GameMode, ModeRegistration };
