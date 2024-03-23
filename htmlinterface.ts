import styleElement from "./gamestyle.js";

class htmlInterface {
  canvas!: HTMLCanvasElement;
  ui!: HTMLDivElement;
  isvalid = false;
  startButton!: HTMLButtonElement;
  credits!: HTMLDivElement;

  constructor() {
    document.head.appendChild(styleElement);

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
    this.startButton.style.display="block";

    this.credits = document.createElement("div");
    this.credits.innerHTML = `
    <h1>Credits</h1>
    <p><u>Music</u></p>
    <p>Permafrost by Scott Buckley<br>
    <p>Released under CC-BY 4.0</p>
    <p><a href = "www.scottbuckley.com.au" target="_blank">www.scottbuckley.com.au</a></p>
    <br/>
    <p><u>Source</u></p>
    <p>Blocks4Gina by Dave Bulkin</p>
    <p>Released under MIT License</p>
    <p><a href = "https://dave.bulkin.net" target="_blank">dave.bulkin.net</a></p>
    <p><a href = "https://github.com/dbulk/blocks-for-gina" target="_blank">git repo</a></p>
    <br/>
    <p><u>Inspo</u></p>
    <p>Gina Mason</p>
    <p><a href = "https://ginamason.net" target="_blank">ginamason.net</a></p>
    <p></p>
    `
    
    this.credits.style.display="inline";
    this.credits.style.position = "relative";
    this.credits.style.top = "-350px";
    this.credits.style.userSelect="none";
    this.credits.style.pointerEvents="none";

    div.appendChild(this.canvas);
    div.appendChild(this.startButton);
    div.appendChild(this.credits);
    div.appendChild(this.ui);
    this.hideControls();
  }
  showControls() {
    if (this.ui) {
      this.ui.style.display = "block";
    }
  }
  hideControls() {
    this.ui.style.display = "none";
  }

  hideStartButton() {
    this.startButton.style.display = "none";
    this.credits.style.display="none";
  }

  resize() {
    if(!this.startButton.hidden){
      this.startButton.style.top = `-${this.canvas.height/2}px`;
    }
  }
}

export default htmlInterface;
