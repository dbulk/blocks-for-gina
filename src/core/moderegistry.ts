interface GameMode {
  id: string
  name: string
  description: string
  implemented: boolean
}

class ModeRegistry {
  private readonly modes = new Map<string, GameMode>();

  register (mode: GameMode): void {
    if (this.modes.has(mode.id)) {
      throw new Error(`Mode already registered: ${mode.id}`);
    }

    this.modes.set(mode.id, mode);
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
  registry.register({ id: 'arcade', name: 'Arcade', description: 'Play until there are no valid moves. Compare your best runs.', implemented: true });
  registry.register({ id: 'sandbox', name: 'Sandbox', description: 'Custom board size and generation. Explore freely.', implemented: true });
  registry.register({ id: 'timed', name: 'Timed', description: 'Score as much as possible before time runs out.', implemented: false });
  registry.register({ id: 'sprint', name: 'Sprint', description: 'Maximize score within a fixed move budget.', implemented: false });
  registry.register({ id: 'antigravity', name: 'Antigravity', description: 'Blocks float upward instead of falling. Clear from the top down.', implemented: false });
  registry.register({ id: 'cascade', name: 'Cascade', description: 'Every pop triggers a chain reaction. Combos are everything.', implemented: false });
  registry.register({ id: 'precision', name: 'Precision', description: 'Only pops of a minimum cluster size score. Think before you click.', implemented: false });
  registry.register({ id: 'zen', name: 'Zen', description: 'No pressure, no timer, no game over. Just pop blocks.', implemented: false });
  return registry;
};

export default ModeRegistry;
export { createDefaultModeRegistry };
export type { GameMode };
