import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js";

interface coordinate {
  row: number;
  col: number;
}

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private board: GameBoard;
  private gameSettings: GameSettings;
  private scorePanelSize = 50;
  private blockSize: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    gameboard: GameBoard,
    gameSettings: GameSettings
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.board = gameboard;
    this.gameSettings = gameSettings;

    this.adjustCanvasSize();
    window.addEventListener("resize", this.adjustCanvasSize.bind(this));
  }

  renderBlocks() {
    if (!this.ctx) {
      return;
    }
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height + this.scorePanelSize);

    for (let row = 0; row < this.board.grid.length; row++) {
      for (let col = 0; col < this.board.grid[row].length; col++) {
        const id = this.board.grid[row][col];
        if (id != null) {
          this.renderBlock(row, col, 30);
        }
      }
    }
  }

  renderPreview(coords: coordinate[]) {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }

    for (const c of coords) {
      const id = this.board.grid[c.row][c.col];
      if (id !== null) {
        this.renderBlock(c.row, c.col, -10);
      }
    }
  }

  adjustCanvasSize() {
    // Calculate new canvas width based on 50% of window width
    const windowWidth = window.innerWidth;
    const newCanvasWidth = Math.round((windowWidth * 0.8) / this.gameSettings.numColumns) * this.gameSettings.numColumns;

    // Set canvas size
    this.canvas.width = newCanvasWidth;
    const AR = this.gameSettings.numRows / this.gameSettings.numColumns;

    const boardheight = this.canvas.width * AR;
    this.scorePanelSize = Math.min(boardheight * .1, 50);
    this.canvas.height = boardheight + this.scorePanelSize;

    this.blockSize = this.canvas.width / this.gameSettings.numColumns;
    this.renderBlocks();
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {

    const clickedCol = Math.floor(mouseX / this.blockSize);
    const clickedRow = Math.floor((mouseY - this.scorePanelSize) / this.blockSize);
    return [clickedRow, clickedCol];
  }

  private renderBlock(row: number, col: number, lightenPercent: number): void {
    if (!this.ctx) { return; }
    const id = this.board.grid[row][col];
    if (id === null) { return; };
    const sz = this.blockSize;
    const color = this.gameSettings.blockColors[id];
    const offsetx = this.board.offsetx[row][col] * sz;
    const offsety = this.board.offsety[row][col] * sz;
    const x = col * sz + offsetx;
    const y = row * sz + this.scorePanelSize - offsety;

    const gradient = this.ctx.createLinearGradient(x, y, x + sz, y + sz);
    gradient.addColorStop(0, this.lightenColor(color, lightenPercent));
    gradient.addColorStop(1, color);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, sz, sz);

    if(this.gameSettings.blockLabels){
      const fontFamily = 'Arial'; // Font family
      this.ctx.font = `${this.blockSize/2}px ${fontFamily}`;
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      const lbl = String.fromCharCode('A'.charCodeAt(0) + id);
      this.ctx.fillText(`${lbl}`, x+this.blockSize/2, y+this.blockSize/2);  
    }
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
    const fontFamily = 'Arial'; // Font family
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = "black";

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "ideographic";
    const blocksRemaining = this.board.numBlocksInColumn.reduce((a, v) => a + v, 0);
    const blocksSelected = this.board.blocksToPop.length;
    this.ctx.fillText(blocksSelected ? `Blocks: ${blocksRemaining} (${blocksSelected})` : `Blocks: ${blocksRemaining}`, 10, this.scorePanelSize - 5);

    this.ctx.textAlign = "right";
    const score = this.board.score;
    const selScore = this.board.computeScore(blocksSelected);
    this.ctx.fillText(blocksSelected ? `Score: ${score} (${selScore})` : `Score: ${score}`, this.canvas.width - 10, this.scorePanelSize - 5);
  }
}

export default Renderer;
