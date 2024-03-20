import GameSettings from "./gamesettings.js";


interface Block {
  row: number;
  col: number;
  id: number;
}


class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private grid!: (Block | null)[][];
  private gameSettings: GameSettings;

  constructor(
    canvas: HTMLCanvasElement,
    grid: (Block | null)[][],
    gameSettings: GameSettings
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = grid;
    this.gameSettings = gameSettings;

    this.adjustCanvasSize();
    window.addEventListener("resize", this.adjustCanvasSize.bind(this));
  }

  renderBlocks() {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const row of this.grid) {
      for (const block of row) {
        if (block) {
          this.renderBlock(block);
        }
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
    this.canvas.height = this.canvas.width * AR; // Maintain square aspect ratio (optional)

    this.gameSettings.blockSize = this.canvas.width / this.gameSettings.numColumns;
    this.renderBlocks();
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {
    const clickedCol = Math.floor(mouseX / this.gameSettings.blockSize);
    const clickedRow = Math.floor(mouseY / this.gameSettings.blockSize);
    return [clickedRow, clickedCol];
  }

  private renderBlock(b: Block): void {
    if(!this.ctx){return;}
    const sz = this.gameSettings.blockSize;
    const color = this.gameSettings.blockColors[b.id];
    const x = b.col * sz;
    const y = b.row * sz;
        
    const gradient = this.ctx.createLinearGradient(x,y,x+sz,y+sz);
    gradient.addColorStop(0, this.lightenColor(color,30));
    gradient.addColorStop(1,color);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x,y,sz,sz);
    
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
