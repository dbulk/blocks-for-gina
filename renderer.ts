import GameSettings from "./gamesettings.js";

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private grid: (number | null)[][];
  private gameSettings: GameSettings;

  constructor(
    canvas: HTMLCanvasElement,
    grid: (number | null)[][],
    gameSettings: GameSettings
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = grid;
    this.gameSettings = gameSettings;
    
    this.adjustCanvasSize();
    window.addEventListener("resize", this.adjustCanvasSize.bind(this));
  }

  renderGrid() {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game elements
    for (let row = 0; row < this.gameSettings.numBlocksY; row++) {
      for (let col = 0; col < this.gameSettings.numBlocksX; col++) {
        const identity = this.grid[row][col];
        if (identity !== null) {
          // Only render blocks with non-null identity
          const color = this.gameSettings.blockColors[identity];
          const x = col * this.gameSettings.blockSize;
          const y = row * this.gameSettings.blockSize;
          this.renderBlock(x, y, this.gameSettings.blockSize, this.gameSettings.blockSize, color);
        }
      }
    }
  }

  adjustCanvasSize() {
    // Calculate new canvas width based on 50% of window width
    const windowWidth = window.innerWidth;
    const newCanvasWidth = Math.round((windowWidth * 0.8) / this.gameSettings.numBlocksX) * this.gameSettings.numBlocksX;

    // Set canvas size
    this.canvas.width = newCanvasWidth;
    const AR = this.gameSettings.numBlocksY / this.gameSettings.numBlocksX;
    this.canvas.height = this.canvas.width * AR; // Maintain square aspect ratio (optional)

    this.gameSettings.blockSize = this.canvas.width / this.gameSettings.numBlocksX;
    this.renderGrid();
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {
    const clickedCol = Math.floor(mouseX / this.gameSettings.blockSize);
    const clickedRow = Math.floor(mouseY / this.gameSettings.blockSize);
    return [clickedRow, clickedCol];
  }

  private renderBlock(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    if (!this.ctx) {
      return;
    }
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(1, color);
    gradient.addColorStop(0, this.lightenColor(color, 30));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
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
}

export default Renderer;
