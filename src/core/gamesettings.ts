import { DEFAULT_BLOCK_STYLE, isBlockStyle, type BlockStyle } from '@/rendering/blockstyle';

interface serializationPayload {
  blockColors: string[]
  numColumns: number
  numRows: number
  clusterStrength: number
  blockStyle: BlockStyle
  modeId?: string
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
  modeId: string = 'classic';
  isMusicEnabled: boolean = true;
  isSoundEnabled: boolean = true;

  constructor () {
    this.loadSettings();
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
    this.modeId = 'classic';
    this.isMusicEnabled = true;
    this.isSoundEnabled = true;
  }

  deserialize (settings: serializationPayload): void {
    this.blockColors = 'blockColors' in settings ? settings.blockColors : ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'];
    this.numColumns = 'numColumns' in settings ? settings.numColumns : 20;
    this.numRows = 'numRows' in settings ? settings.numRows : 10;
    this.clusterStrength = 'clusterStrength' in settings ? settings.clusterStrength : 0.2;
    this.blockStyle = 'blockStyle' in settings && isBlockStyle(settings.blockStyle) ? settings.blockStyle : DEFAULT_BLOCK_STYLE;
    this.modeId = typeof settings.modeId === 'string' ? settings.modeId : 'classic';
    this.isMusicEnabled = 'isMusicEnabled' in settings ? settings.isMusicEnabled : true;
    this.isSoundEnabled = 'isSoundEnabled' in settings ? settings.isSoundEnabled : true;
  }

  serialize (): serializationPayload {
    return {
      blockColors: this.blockColors,
      numColumns: this.numColumns,
      numRows: this.numRows,
      clusterStrength: this.clusterStrength,
      blockStyle: this.blockStyle,
      modeId: this.modeId,
      isMusicEnabled: this.isMusicEnabled,
      isSoundEnabled: this.isSoundEnabled
    };
  }

  resetToDefaults (): void {
    this.loadSettings();
  }
}
export default GameSettings;
