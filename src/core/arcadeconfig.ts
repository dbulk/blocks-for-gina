interface ArcadeRunConfig {
  readonly numRows: number;
  readonly numColumns: number;
  readonly numBlockTypes: number;
  readonly clusterStrength: number;
}

export const ARCADE_RUN_CONFIG: ArcadeRunConfig = {
  numRows: 10,
  numColumns: 20,
  numBlockTypes: 5,
  clusterStrength: 0.2
};
