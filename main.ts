import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js"

interface coordinate {
  row: number;
  col: number;
}

// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

async function main() {
  const settingsFilePath = "./settings.json";
  const gameSettings = new GameSettings();
  await gameSettings.loadSettings(settingsFilePath);

  const gameBoard = new GameBoard(gameSettings);
  const renderer = new Renderer(canvas, gameBoard, gameSettings);

  canvas.addEventListener("click", gameBoard.click.bind(gameBoard));

  function handleMouseHover(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const [row, col] = renderer.getGridIndicesFromMouse(mouseX, mouseY);
    gameBoard.hover({row,col})
  }
  canvas.addEventListener("mousemove", handleMouseHover);
  canvas.addEventListener("mouseleave", gameBoard.mouseExit.bind(gameBoard));

  const moverate = 0.2;
  function animationLoop(){
    renderer.renderBlocks();
    
    // todo: add a clock
    let turnItOff = true;
    for(let r = 0; r < gameSettings.numRows; r++){
      for(let c = 0; c < gameSettings.numColumns; c++){
        gameBoard.offsetx[r][c] = Math.max(gameBoard.offsetx[r][c] - moverate, 0);
        gameBoard.offsety[r][c] = Math.max(gameBoard.offsety[r][c] - moverate, 0);
        if(gameBoard.offsetx[r][c]>0 || gameBoard.offsety[r][c]>0){
          turnItOff=false;
        }
      }
    }
    if(turnItOff){
      gameBoard.doAnimation = false;
    } else {
      requestAnimationFrame(animationLoop);
    }
  }
  function gameLoop() {
    gameBoard.update();
    
    if (gameBoard.doAnimation) {
      requestAnimationFrame(animationLoop);
    }
  
    renderer.renderBlocks();
    renderer.renderPreview(gameBoard.blocksToPop);
    renderer.renderScoreBoard();

    // Schedule the next iteration of the game loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

main();
