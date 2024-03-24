import GameSettings from "./gamesettings.js";
import GameState from "./gamestate.js"

interface coordinate {
  row: number;
  col: number;
}

// todo: compute this? compute max num blocks?
const MAXBLOCKSIZE = 100;

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private gameState!: GameState;
  private gameSettings: GameSettings;
  private scorePanelSize = 50;
  private blockSize: number = 0;
  private blockCanvases: HTMLCanvasElement[] = [];

  constructor(canvas: HTMLCanvasElement, gameSettings: GameSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gameSettings = gameSettings;

    // create an offscreen canvas for each block type:
    for (let i = 0; i < gameSettings.blockColors.length; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = MAXBLOCKSIZE;
      canvas.height = MAXBLOCKSIZE;
      this.blockCanvases.push(canvas);
    }

    this.adjustCanvasSize();
  }

  setGameState(gameState: GameState) {
    // temporary  until we move to gamestate
    this.gameState = gameState;
  }

  renderBlocks() {
    if (!this.ctx) {
      return;
    }

    // Set up an offscreen canvas for each block type
    this.createOffscrenCanvases(30);

    // Clear canvas
    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    for (let row = 0; row < this.gameSettings.numRows; row++) {
      for (let col = 0; col < this.gameSettings.numColumns; col++) {
        const coord = { row, col };
        this.renderBlock(coord);
      }
    }
  }

  renderPreview(coords: coordinate[]) {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }
    this.createOffscrenCanvases(-10);

    for (const c of coords) {
      this.renderBlock(c);
    }
  }

  adjustCanvasSize() {
    // Calculate new canvas width based on 50% of window width
    const windowWidth = window.innerWidth;
    const newCanvasWidth =
      Math.round((windowWidth * 0.8) / this.gameSettings.numColumns) *
      this.gameSettings.numColumns;

    // Set canvas size
    this.canvas.width = newCanvasWidth;
    const AR = this.gameSettings.numRows / this.gameSettings.numColumns;

    const boardheight = this.canvas.width * AR;
    this.scorePanelSize = Math.min(boardheight * 0.1, 50);
    this.canvas.height = boardheight + this.scorePanelSize;

    this.blockSize = this.canvas.width / this.gameSettings.numColumns;
    if (this.gameState) {
      this.gameState.blocksDirty = true;
    }
  }

  getGridIndicesFromMouse(event: MouseEvent): coordinate {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const col = Math.floor(mouseX / this.blockSize);
    const row = Math.floor(
      (mouseY - this.scorePanelSize) / this.blockSize
    );
    return { row, col };
  }

  private createOffscrenCanvases(lightStrength: number): void {
    for (let i = 0; i < this.blockCanvases.length; i++) {
      const canvas = this.blockCanvases[i];
      const color = this.gameSettings.blockColors[i];
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createLinearGradient(
          0,
          0,
          MAXBLOCKSIZE,
          MAXBLOCKSIZE
        );
        gradient.addColorStop(0, this.lightenColor(color, lightStrength));
        gradient.addColorStop(1, color);
        ctx.fillStyle = gradient;
        // todo: 100 is the MAXBLOCKSIZE
        ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

        if (this.gameSettings.blockLabels) {
          const fontFamily = "Arial"; // Font family
          ctx.font = `${MAXBLOCKSIZE / 2}px ${fontFamily}`;
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lbl = String.fromCharCode("A".charCodeAt(0) + i);
          ctx.fillText(`${lbl}`, MAXBLOCKSIZE / 2, MAXBLOCKSIZE / 2);
        }
      }
    }
  }
  private renderBlock(coord: coordinate): void {
    if (!this.ctx) {
      return;
    }
    const id = this.gameState.getBlockID(coord);
    if (id === null) {
      return;
    }
    const sz = this.blockSize;
    const offset = this.gameState.getBlockOffset(coord);
    const x = (coord.col + offset.x) * sz;
    const y = (coord.row - offset.y) * sz + this.scorePanelSize;
    this.ctx.drawImage(this.blockCanvases[id], x, y, sz, sz);
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  renderScoreBoard() {
    if (!this.ctx) {
      return;
    }
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0, 0, this.canvas.width, this.scorePanelSize);

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2; // Adjust the line width as needed
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.scorePanelSize); // Start from the top-left corner of the rectangle
    this.ctx.lineTo(this.canvas.width, this.scorePanelSize); // Draw a line to the top-right corner
    this.ctx.stroke(); // Draw the line

    const fontSize = this.scorePanelSize - 10; // Font size in pixels
    const fontFamily = "Arial"; // Font family
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = "black";

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "ideographic";

    const blocksSelected = this.gameState.getNumBlocksToPop();
    
    this.ctx.fillText(
      blocksSelected
        ? `Blocks: ${this.gameState.getNumBlocksRemaining()} (${blocksSelected})`
        : `Blocks: ${this.gameState.getNumBlocksRemaining()}`,
      10,
      this.scorePanelSize - 5
    );

    this.ctx.textAlign = "right";
    const score = this.gameState.getScore();
    const selScore = this.gameState.getPopListScore();
    this.ctx.fillText(
      blocksSelected ? `Score: ${score} (${selScore})` : `Score: ${score}`,
      this.canvas.width - 10,
      this.scorePanelSize - 5
    );
  }
}

export default Renderer;
