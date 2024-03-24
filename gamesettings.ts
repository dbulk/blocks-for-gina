// todo: put this somewhere (maybe it's even a class to make it easier to manip?)
interface uinodes {
  div: HTMLDivElement;
  cmdNewGame: HTMLButtonElement;
  togMusic: HTMLButtonElement;
  togSound: HTMLButtonElement;
  expandButton: HTMLButtonElement;
  divSettings: HTMLDivElement;
  inputRows: HTMLInputElement;
  inputColumns: HTMLInputElement;
  inputClusterStrength: HTMLInputElement;
  inputColors: HTMLInputElement[];
}

class GameSettings {
  numColumns!: number;
  numRows!: number;
  blockColors!: string[];
  numBlockTypes!: number;
  clusterStrength!: number;
  blockLabels!: boolean;
  ui: uinodes;

  constructor(ui : uinodes) {
    this.ui = ui;
    this.loadSettings();
    this.settingsToUI();
  }

  loadSettings() {
    // todo: eliminate this...
    this.numColumns = 20;
    this.numRows = 10;
    this.blockColors = ["#007B7F", "#FF6F61", "#4F86F7", "#B6D94C", "#8368F2"];
    this.numBlockTypes = this.blockColors.length;
    this.clusterStrength = 0.6;
    this.blockLabels = false;
  }

  deserialize(settings: serializationPayload) {
    this.blockColors = settings.blockColors ? settings.blockColors : ["#007B7F", "#FF6F61", "#4F86F7", "#B6D94C", "#8368F2"];
    this.numColumns = settings.numColumns ? settings.numColumns : 20;
    this.numRows = settings.numRows ? settings.numRows : 10;
    this.clusterStrength = settings.clusterStrength ? settings.clusterStrength : 0.6;
    settings.isMusicEnabled ? this.ui.togMusic.classList.add('active') : this.ui.togMusic.classList.remove('active');
    settings.isSoundEnabled ? this.ui.togSound.classList.add('active') : this.ui.togSound.classList.remove('active');
    this.settingsToUI();
  }
  serialize() : serializationPayload {
    return {
      blockColors: this.blockColors,
      numColumns : this.numColumns,
      numRows : this.numRows,
      clusterStrength : this.clusterStrength,
      isMusicEnabled : this.ui.togMusic.classList.contains("active"),
      isSoundEnabled : this.ui.togSound.classList.contains("active")
    };
  }
  
  settingsToUI() {
    this.ui.inputRows.value = this.numRows.toString();
    this.ui.inputColumns.value = this.numColumns.toString();
    this.ui.inputClusterStrength.value = this.clusterStrength.toString();
    for(let i = 0; i < this.numBlockTypes; ++i){
      this.ui.inputColors[i].value = this.blockColors[i];
    }
  }

  uiToSettings() {
    // note: this shouldn't be called 'mid-game'
    this.numRows = this.ui.inputRows.valueAsNumber;
    this.numColumns = this.ui.inputColumns.valueAsNumber;
    this.clusterStrength = this.ui.inputClusterStrength.valueAsNumber;
  }

  uiColorsToSettings() {
    // this is safe to call mid game
    for(let i = 0; i < this.numBlockTypes; ++i){
      this.blockColors[i] = this.ui.inputColors[i].value;
    }
  }

}

interface serializationPayload{
  blockColors: string[],
  numColumns: number,
  numRows: number,
  clusterStrength: number,
  isMusicEnabled: boolean,
  isSoundEnabled: boolean
}
export default GameSettings;
