import { SPRINT_MODE_MAX_MOVES } from '@/core/moderules';

interface ModeSummaryHooks {
  title: string
  hideBlocksRemaining: boolean
  formatMoves: (totalMoves: number) => string
}

type ModeSummaryHookRegistration = Partial<Omit<ModeSummaryHooks, 'formatMoves'>> & {
  formatMoves?: ModeSummaryHooks['formatMoves']
};

const defaultHooks: ModeSummaryHooks = {
  title: 'Game Over',
  hideBlocksRemaining: false,
  formatMoves: (totalMoves: number) => `${totalMoves}`
};

const modeSummaryHooks = new Map<string, ModeSummaryHookRegistration>([
  ['timed', { title: "Time's Up!", hideBlocksRemaining: true }],
  ['sprint', { title: 'Sprint Complete!', formatMoves: (totalMoves: number) => `${totalMoves}/${SPRINT_MODE_MAX_MOVES}` }]
]);

const builtInModeSummaryHooks = new Map(modeSummaryHooks);

const normalizeModeId = (modeId: string): string => modeId.trim();

const resetModeSummaryHooks = (): void => {
  modeSummaryHooks.clear();
  builtInModeSummaryHooks.forEach((hooks, id) => modeSummaryHooks.set(id, hooks));
};

const registerModeSummaryHooks = (modeId: string, hooks: ModeSummaryHookRegistration): void => {
  const normalizedId = normalizeModeId(modeId);
  if (normalizedId === '') {
    throw new Error('Mode id is required for summary hooks');
  }
  modeSummaryHooks.set(normalizedId, hooks);
};

const getModeSummaryHooks = (modeId: string): ModeSummaryHooks => {
  const hooks = modeSummaryHooks.get(modeId);
  return {
    title: hooks?.title ?? defaultHooks.title,
    hideBlocksRemaining: hooks?.hideBlocksRemaining ?? defaultHooks.hideBlocksRemaining,
    formatMoves: hooks?.formatMoves ?? defaultHooks.formatMoves
  };
};

export { getModeSummaryHooks, registerModeSummaryHooks, resetModeSummaryHooks };
export type { ModeSummaryHooks, ModeSummaryHookRegistration };
