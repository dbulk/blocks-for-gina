import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js";

interface coordinate {
  row: number;
  col: number;
}

// todo: compute this? compute max num blocks?
const MAXBLOCKSIZE = 100;

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private board!: GameBoard;
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

  setGameBoard(gameBoard: GameBoard) {
    // temporary  until we move to gamestate
    this.board = gameBoard;
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
      this.canvas.height + this.scorePanelSize
    );

    for (let row = 0; row < this.board.grid.length; row++) {
      for (let col = 0; col < this.board.grid[row].length; col++) {
        const id = this.board.grid[row][col];
        if (id != null) {
          this.renderBlock(row, col);
        }
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
      const id = this.board.grid[c.row][c.col];
      if (id !== null) {
        this.renderBlock(c.row, c.col);
      }
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
    if(this.board){
        this.board.blocksDirty = true;
    }
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {
    const clickedCol = Math.floor(mouseX / this.blockSize);
    const clickedRow = Math.floor(
      (mouseY - this.scorePanelSize) / this.blockSize
    );
    return [clickedRow, clickedCol];
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
  private renderBlock(row: number, col: number): void {
    if (!this.ctx) {
      return;
    }
    const id = this.board.grid[row][col];
    if (id === null) {
      return;
    }
    const sz = this.blockSize;
    const offsetx = this.board.offsetx[row][col] * sz;
    const offsety = this.board.offsety[row][col] * sz;
    const x = col * sz + offsetx;
    const y = row * sz + this.scorePanelSize - offsety;

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
    const blocksSelected = this.board.blocksToPop.length;
    this.ctx.fillText(
      blocksSelected
        ? `Blocks: ${this.board.getNumberOfBlocks()} (${blocksSelected})`
        : `Blocks: ${this.board.getNumberOfBlocks()}`,
      10,
      this.scorePanelSize - 5
    );

    this.ctx.textAlign = "right";
    const score = this.board.score;
    const selScore = this.board.computeScore(blocksSelected);
    this.ctx.fillText(
      blocksSelected ? `Score: ${score} (${selScore})` : `Score: ${score}`,
      this.canvas.width - 10,
      this.scorePanelSize - 5
    );
  }
}

export default Renderer;
