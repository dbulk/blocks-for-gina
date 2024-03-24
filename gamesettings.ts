import { json } from "stream/consumers";

function makeButton(text: string, isToggle: boolean, div: HTMLDivElement) {
  const button = document.createElement("button");
  button.textContent = text;
  if (isToggle) {
    button.className = "toggle";
    button.classList.add("active");
    button.addEventListener("click", () => button.classList.toggle("active"));
  }

  button.style.userSelect="none";
  div.appendChild(button);
  return button;
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
  cmdSerialize: HTMLButtonElement;
  cmdDeserialize: HTMLButtonElement;

  constructor(div: HTMLDivElement) {
    div.style.paddingTop = "10px";
    this.cmdNewGame = makeButton("New Game", false, div);
    this.togMusic = makeButton("🎵", true, div);
    this.togSound = makeButton("🔊", true, div);
    this.cmdSerialize = makeButton("💾", false, div);
    this.cmdDeserialize = makeButton("📂", false, div);
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

  serialize() {
    return {blockColors: this.blockColors};
  }
}

export default GameSettings;
