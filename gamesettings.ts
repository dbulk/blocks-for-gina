import type UINodes from './uinodes.js';

class GameSettings {
  numColumns!: number;
  numRows!: number;
  blockColors: string[] = [];
  numBlockTypes!: number;
  clusterStrength!: number;
  blockLabels!: boolean;
  ui: UINodes;

  constructor (ui: UINodes) {
    this.ui = ui;
    this.loadSettings();
    this.settingsToUI();
  }

  loadSettings (): void {
    // todo: eliminate this...
    this.numColumns = 20;
    this.numRows = 10;
    this.blockColors = ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'];
    this.numBlockTypes = this.blockColors.length;
    this.clusterStrength = 0.2;
    this.blockLabels = false;
  }

  deserialize (settings: serializationPayload): void {
    this.blockColors = 'blockColors' in settings ? settings.blockColors : ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'];
    this.numColumns = 'numColumns' in settings ? settings.numColumns : 20;
    this.numRows = 'numRows' in settings ? settings.numRows : 10;
    this.clusterStrength = 'clusterStrength' in settings ? settings.clusterStrength : 0.2;
    this.ui.setTogMusic(settings.isMusicEnabled);
    this.ui.setTogSound(settings.isSoundEnabled);
    this.settingsToUI();
  }

  serialize (): serializationPayload {
    return {
      blockColors: this.blockColors,
      numColumns: this.numColumns,
      numRows: this.numRows,
      clusterStrength: this.clusterStrength,
      isMusicEnabled: this.ui.getTogMusic(),
      isSoundEnabled: this.ui.getTogSound()
    };
  }

  settingsToUI (): void {
    this.ui.setInputRows(this.numRows);
    this.ui.setInputColumns(this.numColumns);
    this.ui.setInputClusterStrength(this.clusterStrength);
    this.ui.setInputColors(this.blockColors);
  }

  uiToSettings (): void {
    // note: this shouldn't be called 'mid-game'
    this.numRows = this.ui.getInputRows();
    this.numColumns = this.ui.getInputColumns();
    this.clusterStrength = this.ui.getInputClusterStrength();
  }

  uiColorsToSettings (): void {
    // this is safe to call mid game
    this.blockColors = [];
    this.ui.getInputColors(this.blockColors);
  }
}

interface serializationPayload {
  blockColors: string[]
  numColumns: number
  numRows: number
  clusterStrength: number
  isMusicEnabled: boolean
  isSoundEnabled: boolean
}
export default GameSettings;
