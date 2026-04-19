import type UINodes from '@/presentation/uinodes';
import { DEFAULT_BLOCK_STYLE, isBlockStyle, type BlockStyle } from '@/rendering/blockstyle';

interface serializationPayload {
  blockColors: string[]
  numColumns: number
  numRows: number
  clusterStrength: number
  blockStyle: BlockStyle
  isMusicEnabled: boolean
  isSoundEnabled: boolean
}

class GameSettings {
  numColumns!: number;
  numRows!: number;
  blockColors: string[] = [];
  numBlockTypes!: number;
  clusterStrength!: number;
  blockLabels!: boolean;
  blockStyle!: BlockStyle;
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
    this.blockStyle = DEFAULT_BLOCK_STYLE;
  }

  deserialize (settings: serializationPayload): void {
    this.blockColors = 'blockColors' in settings ? settings.blockColors : ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'];
    this.numColumns = 'numColumns' in settings ? settings.numColumns : 20;
    this.numRows = 'numRows' in settings ? settings.numRows : 10;
    this.clusterStrength = 'clusterStrength' in settings ? settings.clusterStrength : 0.2;
    this.blockStyle = 'blockStyle' in settings && isBlockStyle(settings.blockStyle) ? settings.blockStyle : DEFAULT_BLOCK_STYLE;
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
      blockStyle: this.blockStyle,
      isMusicEnabled: this.ui.getTogMusic(),
      isSoundEnabled: this.ui.getTogSound()
    };
  }

  settingsToUI (): void {
    this.ui.setInputRows(this.numRows);
    this.ui.setInputColumns(this.numColumns);
    this.ui.setInputClusterStrength(this.clusterStrength);
    this.ui.setInputBlockStyle(this.blockStyle);
    this.ui.setInputColors(this.blockColors);
  }

  resetToDefaults (): void {
    this.loadSettings();
    this.settingsToUI();
    this.ui.setTogMusic(true);
    this.ui.setTogSound(true);
  }

  uiToSettings (): void {
    // note: this shouldn't be called 'mid-game'
    this.numRows = this.ui.getInputRows();
    this.numColumns = this.ui.getInputColumns();
    this.clusterStrength = this.ui.getInputClusterStrength();
    this.blockStyle = this.ui.getInputBlockStyle();
  }

  uiAllToSettings (): void {
    this.uiToSettings();
    this.uiColorsToSettings();
  }

  uiColorsToSettings (): void {
    // this is safe to call mid game
    this.blockColors = [];
    this.ui.getInputColors(this.blockColors);
  }
}
export default GameSettings;
