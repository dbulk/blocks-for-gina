class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: (CanvasRenderingContext2D | null);
  private blockSize: number;
  private grid: (number | null)[][];
  private numBlocksX: number;
  private numBlocksY: number;
  private blockColors: string[];

  constructor(
    canvas: HTMLCanvasElement,
    blockSize: number,
    grid: (number | null)[][],
    numBlocksX: number,
    numBlocksY: number,
    blockColors: string[]
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.blockSize = blockSize;
    this.grid = grid;
    this.numBlocksX = numBlocksX;
    this.numBlocksY = numBlocksY;
    this.blockColors = blockColors;
  }

  renderGrid() {
    // Implement rendering logic
    if(!this.ctx) {
        return;
    }
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game elements
    for (let row = 0; row < this.numBlocksY; row++) {
      for (let col = 0; col < this.numBlocksX; col++) {
        const identity = this.grid[row][col];
        if (identity !== null) {
          // Only render blocks with non-null identity
          const color = this.blockColors[identity];
          const x = col * this.blockSize;
          const y = row * this.blockSize;
          this.renderBlock(x, y, this.blockSize, this.blockSize, color);
        }
      }
    }
  }

  adjustCanvasSize(numBlocksX: number, numBlocksY: number) {
    // Calculate new canvas width based on 50% of window width
    const windowWidth = window.innerWidth;
    const newCanvasWidth =
      Math.round((windowWidth * 0.8) / numBlocksX) * numBlocksX;

    // Set canvas size
    this.canvas.width = newCanvasWidth;
    const AR = numBlocksY / numBlocksX;
    this.canvas.height = this.canvas.width * AR; // Maintain square aspect ratio (optional)

    this.blockSize = this.canvas.width / numBlocksX;
    this.renderGrid();
  }

  getGridIndicesFromMouse(mouseX: number, mouseY: number): [number, number] {
    const clickedCol = Math.floor(mouseX / this.blockSize);
    const clickedRow = Math.floor(mouseY / this.blockSize);
    return [clickedRow, clickedCol];
  }

  private renderBlock(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
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