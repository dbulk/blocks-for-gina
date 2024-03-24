
interface uinodes {
  div: HTMLDivElement,
  cmdNewGame: HTMLButtonElement,
  togMusic: HTMLButtonElement,
  togSound: HTMLButtonElement,
}

class GameSettings {
  numColumns!: number;
  numRows!: number;
  blockColors!: string[];
  numBlockTypes!: number;
  clusterStrength!: number;
  blockLabels!: boolean;
  cmdNewGame: HTMLButtonElement;
  togMusic: HTMLButtonElement;
  togSound: HTMLButtonElement;

  constructor(ui : uinodes) {
    this.cmdNewGame = ui.cmdNewGame;
    this.togMusic = ui.togMusic;
    this.togSound = ui.togSound;
    this.loadSettings();
  }

  loadSettings() {
    this.numColumns = 20;
    this.numRows = 10;
    this.blockColors = ["#007B7F", "#FF6F61", "#4F86F7", "#B6D94C", "#8368F2"];
    this.numBlockTypes = this.blockColors.length;
    this.clusterStrength = 0.6;
    this.blockLabels = false;
  }

  deserialize(settings: serializationPayload) {
    this.blockColors = settings.blockColors;
    this.numColumns = settings.numColumns;
    this.numRows = settings.numRows;
    settings.isMusicEnabled ? this.togMusic.classList.add('active') : this.togMusic.classList.remove('active');
    settings.isSoundEnabled ? this.togSound.classList.add('active') : this.togSound.classList.remove('active');
  }
  serialize() : serializationPayload {
    return {
      blockColors: this.blockColors,
      numColumns : this.numColumns,
      numRows : this.numRows,
      isMusicEnabled : this.togMusic.classList.contains("active"),
      isSoundEnabled : this.togSound.classList.contains("active")
    };
  }
}

interface serializationPayload{
  blockColors: string[],
  numColumns: number,
  numRows: number,
  isMusicEnabled: boolean,
  isSoundEnabled: boolean
}
export default GameSettings;
