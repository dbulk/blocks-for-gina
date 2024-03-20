import GameSettings from "./gamesettings.js";


const scorePanelSize = 50;

interface coordinate {
  row: number;
  col: number;
}

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

  renderBlocks() {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height-scorePanelSize);

    for(let row = 0; row < this.grid.length; row++){
      for(let col = 0; col < this.grid[row].length; col++){
        const id = this.grid[row][col];
        if(id!=null){
          this.renderBlock(row,col,30);
        }
      }
    }
  }
  
  renderPreview(coords : coordinate[]) {
    // Implement rendering logic
    if (!this.ctx) {
      return;
    }

    for(const c of coords){
      const id = this.grid[c.row][c.col];
        if(id!==null){
          this.renderBlock(c.row,c.col,-10);
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
    this.canvas.height = this.canvas.width * AR + scorePanelSize;

    this.gameSettings.blockSize = this.canvas.width / this.gameSettings.numColumns;
    this.renderBlocks();
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {
    const clickedCol = Math.floor(mouseX / this.gameSettings.blockSize);
    const clickedRow = Math.floor((mouseY-scorePanelSize) / this.gameSettings.blockSize);
    return [clickedRow, clickedCol];
  }

  private renderBlock(row: number, col: number, lightenPercent: number): void {
    if(!this.ctx){return;}
    const id = this.grid[row][col];
    if(id===null){return;};
    const sz = this.gameSettings.blockSize;
    const color = this.gameSettings.blockColors[id];
    const x = col * sz;
    const y = row * sz+scorePanelSize;
    
      const gradient = this.ctx.createLinearGradient(x,y,x+sz,y+sz);
      gradient.addColorStop(0, this.lightenColor(color, lightenPercent));
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

  renderScoreBoard() {
    if(!this.ctx){
      return;
    }
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0,0,this.canvas.width,scorePanelSize);
    
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2; // Adjust the line width as needed
    this.ctx.beginPath();
    this.ctx.moveTo(0, scorePanelSize); // Start from the top-left corner of the rectangle
    this.ctx.lineTo(this.canvas.width, scorePanelSize); // Draw a line to the top-right corner
    this.ctx.stroke(); // Draw the line
  }
}

export default Renderer;
