interface GameMode {
  id: string
  name: string
  description: string
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
  registry.register({ id: 'classic', name: 'Classic', description: 'Play until there are no valid moves.' });
  registry.register({ id: 'timed', name: 'Timed', description: 'Score as much as possible before time runs out.' });
  registry.register({ id: 'move-limited', name: 'Move-Limited', description: 'Maximize score within a fixed move budget.' });
  return registry;
};

export default ModeRegistry;
export { createDefaultModeRegistry };
export type { GameMode };
