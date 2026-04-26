interface ModeRuntimeState {
  cascadeCurrentChainDepth: number
  cascadeBestChainDepth: number
  cascadeComboBonus: number
  precisionTargetSize: number
  precisionStrikes: number
  precisionStreak: number
}

type ModeRuntimePayload = Partial<ModeRuntimeState>;

const createModeRuntimeState = (): ModeRuntimeState => ({
  cascadeCurrentChainDepth: 0,
  cascadeBestChainDepth: 0,
  cascadeComboBonus: 0,
  precisionTargetSize: 2,
  precisionStrikes: 0,
  precisionStreak: 0
});

const resetModeRuntimeState = (): ModeRuntimeState => createModeRuntimeState();

const startCascadeTurn = (state: ModeRuntimeState): ModeRuntimeState => ({
  ...state,
  cascadeCurrentChainDepth: 0,
  cascadeComboBonus: 0
});

const recordCascadeWave = (
  state: ModeRuntimeState,
  clusterSize: number,
  scoreMultiplier: number,
  computeScore: (clusterSize: number) => number
): ModeRuntimeState => {
  if (clusterSize <= 0) {
    return state;
  }

  const nextChainDepth = state.cascadeCurrentChainDepth + 1;
  return {
    ...state,
    cascadeCurrentChainDepth: nextChainDepth,
    cascadeBestChainDepth: Math.max(state.cascadeBestChainDepth, nextChainDepth),
    cascadeComboBonus: state.cascadeComboBonus + Math.floor(computeScore(clusterSize) * Math.max(0, scoreMultiplier - 1))
  };
};

const setPrecisionTargetSize = (state: ModeRuntimeState, size: number): ModeRuntimeState => ({
  ...state,
  precisionTargetSize: Math.max(2, Math.floor(size))
});

const recordPrecisionMiss = (state: ModeRuntimeState): ModeRuntimeState => ({
  ...state,
  precisionStrikes: Math.min(3, state.precisionStrikes + 1),
  precisionStreak: 0
});

const getPrecisionHitMultiplier = (state: ModeRuntimeState): number => 1 + Math.min(4, state.precisionStreak) * 0.25;

const recordPrecisionExactHit = (state: ModeRuntimeState): ModeRuntimeState => ({
  ...state,
  precisionStreak: state.precisionStreak + 1
});

const readModeRuntimeState = (payload: ModeRuntimePayload): ModeRuntimeState => ({
  cascadeCurrentChainDepth: payload.cascadeCurrentChainDepth ?? 0,
  cascadeBestChainDepth: payload.cascadeBestChainDepth ?? 0,
  cascadeComboBonus: payload.cascadeComboBonus ?? 0,
  precisionTargetSize: Math.max(2, payload.precisionTargetSize ?? 2),
  precisionStrikes: Math.max(0, payload.precisionStrikes ?? 0),
  precisionStreak: Math.max(0, payload.precisionStreak ?? 0)
});

export {
  createModeRuntimeState,
  resetModeRuntimeState,
  startCascadeTurn,
  recordCascadeWave,
  setPrecisionTargetSize,
  recordPrecisionMiss,
  getPrecisionHitMultiplier,
  recordPrecisionExactHit,
  readModeRuntimeState
};
export type { ModeRuntimeState, ModeRuntimePayload };