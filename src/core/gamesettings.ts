interface serializationPayload {
  numColumns: number
  numRows: number
  numBlockTypes: number
  clusterStrength: number
  modeId?: string
}

class GameSettings {
  numColumns!: number;
  numRows!: number;
  numBlockTypes!: number;
  clusterStrength!: number;
  blockLabels!: boolean;
  modeId: string = 'classic';

  constructor () {
    this.loadSettings();
  }

  loadSettings (): void {
    this.numColumns = 20;
    this.numRows = 10;
    this.numBlockTypes = 5;
    this.clusterStrength = 0.2;
    this.blockLabels = false;
    this.modeId = 'classic';
  }

  deserialize (settings: serializationPayload): void {
    this.numColumns = 'numColumns' in settings ? settings.numColumns : 20;
    this.numRows = 'numRows' in settings ? settings.numRows : 10;
    this.numBlockTypes = 'numBlockTypes' in settings ? settings.numBlockTypes : 5;
    this.clusterStrength = 'clusterStrength' in settings ? settings.clusterStrength : 0.2;
    this.modeId = typeof settings.modeId === 'string' ? settings.modeId : 'classic';
  }

  serialize (): serializationPayload {
    return {
      numColumns: this.numColumns,
      numRows: this.numRows,
      numBlockTypes: this.numBlockTypes,
      clusterStrength: this.clusterStrength,
      modeId: this.modeId
    };
  }

  resetToDefaults (): void {
    this.loadSettings();
  }
}
export default GameSettings;
