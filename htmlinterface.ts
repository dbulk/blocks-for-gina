interface elements {
  canvas: HTMLCanvasElement;
  ui: HTMLDivElement;
}

class htmlInterface {
  canvas!: HTMLCanvasElement;
  ui!: HTMLDivElement;
  isvalid = false;
  startButton!: HTMLButtonElement;

  constructor() {
    const divTarget = document.getElementById("Blocks4Gina");
    if (!divTarget) {
      console.error("no div for game found");
      return;
    }

    this.isvalid = true;
    divTarget.style.display = "flex";
    divTarget.style.justifyContent = "center";
    divTarget.style.alignItems = "start";
    divTarget.style.height = "100%";
    const div = document.createElement("div");
    div.className = "blocks4Gina";
    (divTarget as HTMLElement).appendChild(div);

    this.canvas = document.createElement("canvas");
    this.canvas.style.border = "2px solid";

    this.ui = document.createElement("div");
    this.canvas.style.display = "block";
    this.ui.style.display = "block";

    this.startButton = document.createElement("button");
    this.startButton.textContent = "PLAY";
    this.startButton.style.padding = "15px 18px";
    this.startButton.style.position = "relative";
    this.startButton.style.left = "50%";
    this.startButton.style.transform = "translate(-50%, -50%)";

    div.appendChild(this.canvas);
    div.appendChild(this.ui);
    div.appendChild(this.startButton);
    this.hideControls();
  }
  showControls() {
    if (this.ui) {
      this.ui.style.display = "block";
    }
  }
  hideControls() {
    if (this.ui) {
      this.ui.style.display = "none";
    }
  }
  showStartButton() {
    if (this.startButton){
      this.startButton.hidden = false;
    } 
  }
  hideStartButton() {
    if (this.startButton){
      this.startButton.hidden = true;
    } 
  }

  resize() {
    if(!this.startButton.hidden){
      this.startButton.style.top = `-${this.canvas.height/2}px`;
    }
  }
}

export default htmlInterface;
