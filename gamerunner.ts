import GameBoard from "./gameboard.js";
import GameSettings from "./gamesettings.js";
import htmlInterface from "./htmlinterface.js";
import Renderer from "./renderer.js";

const MOVERATE = 0.1;

class GameRunner {
  renderer: Renderer;
  settings: GameSettings;
  board: GameBoard;
  canvas: HTMLCanvasElement;
  page: htmlInterface;

  constructor(renderer: Renderer, settings: GameSettings, page: htmlInterface) {
    this.renderer = renderer;
    this.settings = settings;
    this.board = new GameBoard(settings);
    renderer.setGameBoard(this.board);
    this.page = page;
    this.canvas = this.page.canvas as HTMLCanvasElement;
    this.attachListeners();

    this.gameLoop();
  }

  private gameLoop() {
    this.board.update();

    if (this.board.doAnimation) {
      requestAnimationFrame(() => this.animationLoop(performance.now()));
    }

    if (this.board.blocksDirty) {
      this.renderer.renderBlocks();
      this.renderer.renderPreview(this.board.blocksToPop);
      this.renderer.renderScoreBoard();
      this.board.blocksDirty = false;
    }

    // Schedule the next iteration of the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private animationLoop(startTime: number) {
    const elapsedTime = performance.now() - startTime;
    this.renderer.renderBlocks();
    this.renderer.renderScoreBoard();

    const numSteps = Math.floor(elapsedTime * MOVERATE);
    // increment startTime based on how much has been "used"
    startTime += numSteps / MOVERATE;
    let turnItOff = false;
    for (let step = 0; step < numSteps; step++) {
      turnItOff = true;
      for (let r = 0; r < this.board.grid.length; r++) {
        for (let c = 0; c < this.board.grid[0].length; c++) {
          this.board.offsetx[r][c] = Math.max(this.board.offsetx[r][c] - 0.1, 0);
          this.board.offsety[r][c] = Math.max(this.board.offsety[r][c] - 0.1, 0);
          if (this.board.offsetx[r][c] > 0 || this.board.offsety[r][c] > 0) {
            turnItOff = false;
          }
        }
      }
    }
    if (turnItOff) {
      this.board.doAnimation = false;
      this.board.blocksDirty = true;
    } else {
      requestAnimationFrame(() => this.animationLoop(startTime));
    }
  }

  

  private attachListeners() {
    this.canvas.addEventListener("click", this.board.click.bind(this.board));
    this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const [row, col] = this.renderer.getGridIndicesFromMouse(mouseX, mouseY);
      this.board.hover({ row, col });
    });
    this.canvas.addEventListener(
      "mouseleave",
      this.board.mouseExit.bind(this.board)
    );
    
    this.settings.cmdNewGame.addEventListener("click", this.board.reset.bind(this.board));
    
  }
}

export default GameRunner;
