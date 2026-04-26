interface ClassicRunConfig {
  readonly numRows: number;
  readonly numColumns: number;
  readonly numBlockTypes: number;
  readonly clusterStrength: number;
}

export const CLASSIC_RUN_CONFIG: ClassicRunConfig = {
  numRows: 10,
  numColumns: 20,
  numBlockTypes: 5,
  clusterStrength: 0.2
};