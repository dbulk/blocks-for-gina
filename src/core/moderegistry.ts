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

const normalizeModeLookupId = (modeId: string): string => {
  const normalized = normalizeModeId(modeId);
  return normalized === 'arcade' ? 'classic' : normalized;
};

const describeValue = (value: unknown): string => {
  const serialized = JSON.stringify(value);
  return serialized ?? String(value);
};

const createRegistrationError = (
  field: keyof ModeRegistration,
  reason: string,
  received: unknown,
  modeId?: string
): Error => {
  const modeContext = modeId !== undefined ? `; modeId=${describeValue(modeId)}` : '';
  return new Error(`Invalid mode registration (${field}): ${reason}; received=${describeValue(received)}${modeContext}`);
};

class ModeRegistry {
  private readonly modes = new Map<string, GameMode>();

  register (mode: ModeRegistration): void {
    if (typeof mode.id !== 'string') {
      throw createRegistrationError('id', 'must be a non-empty string', mode.id);
    }

    const id = normalizeModeId(mode.id);
    if (id === '') {
      throw createRegistrationError('id', 'must be a non-empty string', mode.id);
    }

    if (typeof mode.name !== 'string' || mode.name.trim() === '') {
      throw createRegistrationError('name', 'must be a non-empty string', mode.name, id);
    }

    if (typeof mode.description !== 'string' || mode.description.trim() === '') {
      throw createRegistrationError('description', 'must be a non-empty string', mode.description, id);
    }

    if (mode.implemented !== undefined && typeof mode.implemented !== 'boolean') {
      throw createRegistrationError('implemented', 'must be a boolean when provided', mode.implemented, id);
    }

    if (mode.competitive !== undefined && typeof mode.competitive !== 'boolean') {
      throw createRegistrationError('competitive', 'must be a boolean when provided', mode.competitive, id);
    }

    if (this.modes.has(id)) {
      throw createRegistrationError('id', 'must be unique (mode already registered)', mode.id, id);
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
    return this.modes.get(normalizeModeLookupId(id)) ?? null;
  }

  list (): GameMode[] {
    return Array.from(this.modes.values());
  }
}

const registerDefaultModes = (registry: ModeRegistry): void => {
  registry.register({ id: 'classic', name: 'Classic', description: 'Play until there are no valid moves. Compare your best runs.', implemented: true, competitive: true });
  registry.register({ id: 'timed', name: 'Timed', description: 'Score as much as possible before time runs out.', implemented: true, competitive: true });
  registry.register({ id: 'sprint', name: 'Sprint', description: 'Maximize score within a fixed move budget.', implemented: true, competitive: true });
  registry.register({ id: 'antigravity', name: 'Antigravity', description: 'Blocks float upward instead of falling. Clear from the top down.', implemented: true, competitive: true });
  registry.register({ id: 'cascade', name: 'Cascade', description: 'Set up one tactical follow-up wave per move. Bigger openings unlock bigger chain bonuses.', implemented: true, competitive: true });
  registry.register({ id: 'precision', name: 'Precision', description: 'Hit exact cluster-size targets. Misses add strikes; streaks boost points.', implemented: true, competitive: true });
  registry.register({ id: 'infinite', name: 'Infinite', description: 'No timer or move cap. Keep playing as new blocks fall in.', implemented: true, competitive: false });
  registry.register({ id: 'sandbox', name: 'Sandbox', description: 'Custom board size and generation. Explore freely.', implemented: true, competitive: false });
};

const createDefaultModeRegistry = (): ModeRegistry => {
  const registry = new ModeRegistry();
  registerDefaultModes(registry);
  return registry;
};

const defaultModeRegistry = createDefaultModeRegistry();

const getDefaultModeRegistry = (): ModeRegistry => defaultModeRegistry;

const getModeMetadata = (modeId: string): GameMode | null => getDefaultModeRegistry().get(modeId);

const isCompetitiveMode = (modeId: string): boolean => getModeMetadata(modeId)?.competitive ?? true;

export default ModeRegistry;
export { createDefaultModeRegistry, getDefaultModeRegistry, getModeMetadata, isCompetitiveMode };
export type { GameMode, ModeRegistration };
