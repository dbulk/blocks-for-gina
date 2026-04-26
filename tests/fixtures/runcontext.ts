import type { RunContext, RunSetup, RunSource } from '@/events/events';

const DEFAULT_RUN_SETUP: RunSetup = {
  numRows: 10,
  numColumns: 20,
  numBlockTypes: 5,
  clusterStrength: 0.2
};

const createRunSetup = (overrides: Partial<RunSetup> = {}): RunSetup => ({
  ...DEFAULT_RUN_SETUP,
  ...overrides
});

const createRunContext = (
  modeId: string,
  source: RunSource = 'modeSelect',
  setupOverrides: Partial<RunSetup> = {}
): RunContext => ({
  modeId,
  source,
  setup: createRunSetup(setupOverrides)
});

export { DEFAULT_RUN_SETUP, createRunSetup, createRunContext };