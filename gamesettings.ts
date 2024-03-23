function makeButton(text: string, isToggle: boolean, div: HTMLDivElement) {
  const button = document.createElement("button");
  button.textContent = text;
  if (isToggle) {
    button.className = "toggle";
    button.classList.add("active");
    button.addEventListener("click", () => button.classList.toggle("active"));
  }
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

  constructor(div: HTMLDivElement) {
    div.style.paddingTop = "10px";
    makeButton("New Game", false, div);
    makeButton("🎵", true, div);
    makeButton("🔊", true, div);

    this.loadSettings();
  }

  loadSettings() {
    this.numColumns = 20;
    this.numRows = 10;
    this.blockColors = ["#007B7F", "#FF6F61", "#4F86F7", "#B6D94C", "#8368F2"];
    this.numBlockTypes = this.blockColors.length;
    this.clusterStrength = 0.2;
    this.blockLabels = false;
  }
}

export default GameSettings;
