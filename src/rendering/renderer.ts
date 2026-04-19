import type GameSettings from '@/core/gamesettings';
import type GameState from '@/core/gamestate';
import type { BlockStyle } from '@/rendering/blockstyle';

interface coordinate {
  row: number
  col: number
}

interface CanvasSizeConstraints {
  width: number
  height: number
}

// todo: compute this? compute max num blocks?
const MAXBLOCKSIZE = 100;

class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly blockCanvases: HTMLCanvasElement[] = [];
  private readonly gameSettings: GameSettings;
  private gameState!: GameState;
  private blockSize: number = 0;

  constructor (canvas: HTMLCanvasElement, gameSettings: GameSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameSettings = gameSettings;

    // create an offscreen canvas for each block type:
    for (let i = 0; i < gameSettings.blockColors.length; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = MAXBLOCKSIZE;
      canvas.height = MAXBLOCKSIZE;
      this.blockCanvases.push(canvas);
    }

    this.adjustCanvasSize();
  }

  setGameState (gameState: GameState): void {
    this.gameState = gameState;
  }

  renderBlocks (): void {
    if (this.ctx === null) {
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

  renderPreview (coords: coordinate[]): void {
    // Implement rendering logic
    if (this.ctx === null) {
      return;
    }
    this.createOffscrenCanvases(-10);

    for (const c of coords) {
      this.renderBlock(c);
    }
  }

  adjustCanvasSize (constraints?: CanvasSizeConstraints): void {
    const availableWidth = Math.max(120, Math.floor((constraints?.width ?? window.innerWidth) - 4));
    const availableHeight = Math.max(120, Math.floor(constraints?.height ?? window.innerHeight));
    const heightNormRows = availableHeight / this.gameSettings.numRows;
    const widthNormCols = availableWidth / this.gameSettings.numColumns;

    const AR = this.gameSettings.numRows / this.gameSettings.numColumns;
    if (widthNormCols > heightNormRows) {
      // plenty of width, use height as constraint
      this.canvas.height = availableHeight;
      this.canvas.width = this.canvas.height / AR;
    } else {
      // plenty of height, use width as a constraint
      this.canvas.width = availableWidth;
      this.canvas.height = this.canvas.width * AR;
    }
    this.blockSize = this.canvas.width / this.gameSettings.numColumns;
    if (this.gameState !== undefined) {
      this.gameState.blocksDirty = true;
    }
  }

  getGridIndicesFromMouse (event: MouseEvent): coordinate {
    return this.getGridIndicesFromClientPosition(event.clientX, event.clientY);
  }

  getGridIndicesFromClientPosition (clientX: number, clientY: number): coordinate {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const col = Math.floor(mouseX / this.blockSize);
    const row = Math.floor(mouseY / this.blockSize);
    return { row, col };
  }

  private createOffscrenCanvases (lightStrength: number): void {
    for (let i = 0; i < this.blockCanvases.length; i++) {
      const canvas = this.blockCanvases[i];
      const color = this.gameSettings.blockColors[i];
      const ctx = canvas.getContext('2d');
      if (ctx !== null) {
        this.drawBlockStyle(ctx, color, this.gameSettings.blockStyle, lightStrength);

        if (this.gameSettings.blockLabels) {
          const fontFamily = 'Arial'; // Font family
          ctx.font = `${MAXBLOCKSIZE / 2}px ${fontFamily}`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lbl = String.fromCharCode('A'.charCodeAt(0) + i);
          ctx.fillText(`${lbl}`, MAXBLOCKSIZE / 2, MAXBLOCKSIZE / 2);
        }
      }
    }
  }

  private drawBlockStyle (ctx: CanvasRenderingContext2D, color: string, style: BlockStyle, lightStrength: number): void {
    ctx.clearRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

    switch (style) {
      case 'Flat':
        this.drawFlat(ctx, color, lightStrength);
        break;
      case 'Gloss':
        this.drawGloss(ctx, color, lightStrength);
        break;
      case 'Neon':
        this.drawNeon(ctx, color, lightStrength);
        break;
      case 'Matte':
        this.drawMatte(ctx, color, lightStrength);
        break;
      case 'Pastel':
        this.drawPastel(ctx, color, lightStrength);
        break;
      case 'Classic':
      default:
        this.drawClassic(ctx, color, lightStrength);
        break;
    }
  }

  private drawClassic (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    const gradient = ctx.createLinearGradient(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
    gradient.addColorStop(0, this.lightenColor(color, lightStrength));
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
  }

  private drawFlat (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    ctx.fillStyle = this.lightenColor(color, Math.round(lightStrength * 0.25));
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
  }

  private drawGloss (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    const body = ctx.createLinearGradient(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
    body.addColorStop(0, this.lightenColor(color, 18 + Math.round(lightStrength * 0.6)));
    body.addColorStop(0.6, color);
    body.addColorStop(1, this.lightenColor(color, -12));
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

    const shine = ctx.createLinearGradient(0, 0, 0, MAXBLOCKSIZE * 0.45);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE * 0.45);

    const bottomShade = ctx.createLinearGradient(0, MAXBLOCKSIZE * 0.55, 0, MAXBLOCKSIZE);
    bottomShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomShade.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = bottomShade;
    ctx.fillRect(0, MAXBLOCKSIZE * 0.55, MAXBLOCKSIZE, MAXBLOCKSIZE * 0.45);
  }

  private drawNeon (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    ctx.fillStyle = this.lightenColor(color, -30);
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

    const center = MAXBLOCKSIZE / 2;
    const glow = ctx.createRadialGradient(center, center, MAXBLOCKSIZE * 0.12, center, center, MAXBLOCKSIZE * 0.58);
    glow.addColorStop(0, this.lightenColor(color, 20 + Math.round(lightStrength * 0.35)));
    glow.addColorStop(0.65, this.lightenColor(color, 4));
    glow.addColorStop(1, this.lightenColor(color, -12));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
  }

  private drawMatte (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, MAXBLOCKSIZE);
    gradient.addColorStop(0, this.lightenColor(color, -14 + Math.round(lightStrength * 0.2)));
    gradient.addColorStop(1, this.lightenColor(color, -28));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

    const grain = ctx.createLinearGradient(0, 0, MAXBLOCKSIZE, 0);
    grain.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grain.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
    grain.addColorStop(1, 'rgba(0, 0, 0, 0.04)');
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
  }

  private drawPastel (ctx: CanvasRenderingContext2D, color: string, lightStrength: number): void {
    const base = this.lightenColor(color, 30 + Math.round(lightStrength * 0.3));
    const gradient = ctx.createLinearGradient(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
    gradient.addColorStop(0, this.lightenColor(base, 6));
    gradient.addColorStop(1, this.lightenColor(base, -4));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);

    const soft = ctx.createLinearGradient(0, 0, MAXBLOCKSIZE, 0);
    soft.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    soft.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, MAXBLOCKSIZE, MAXBLOCKSIZE);
  }

  private renderBlock (coord: coordinate): void {
    if (this.ctx === null) {
      return;
    }
    const id = this.gameState.getBlockID(coord);
    if (id === null) {
      return;
    }
    const sz = this.blockSize;
    const offset = this.gameState.getBlockOffset(coord);
    const x = (coord.col + offset.x) * sz;
    const y = (coord.row - offset.y) * sz;
    this.ctx.drawImage(this.blockCanvases[id], x, y, sz, sz);
  }

  private lightenColor (color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      '#' +
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

  showGameOver (alpha: number): void {
    if (this.ctx === null) {
      return;
    }
    // Clear canvas
    this.renderBlocks();
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export default Renderer;
export type { CanvasSizeConstraints };
