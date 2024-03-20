import GameSettings from "./gamesettings.js";

interface coordinate {
  row: number;
  col: number;
}
class GameBoard {
  private gameSettings: GameSettings;
  grid: (number | null)[][] = [];
  numBlocksInColumn: number[] = [];
  needsgravity = false;
  blocksToPop : coordinate[] = [];
  hoverCache: (coordinate | null) = null;

  constructor(gameSettings: GameSettings) {
    this.gameSettings = gameSettings;

    // initialize blocks
    for (let row = 0; row < gameSettings.numRows; row++) {
      this.grid[row] = Array(this.gameSettings.numColumns).fill(null);
      for (let col = 0; col < gameSettings.numColumns; col++) {
        const id = Math.floor(Math.random() * gameSettings.numBlockTypes);
        this.grid[row][col] = id;
      }
    }
    this.numBlocksInColumn = new Array(gameSettings.numColumns).fill(
      gameSettings.numRows
    );
  }

  click() {
    if(this.blocksToPop.length){
      for (const coord of this.blocksToPop) {
        this.grid[coord.row][coord.col] = null;
        this.numBlocksInColumn[coord.col]--;
      }
      this.needsgravity = true;
      this.blocksToPop=[];
      this.hoverCache = null;
    }
  }

  hover(target : coordinate) {
    // todo: i need to have this set a mouse position that and have blockToPop update in the game loop - if i pop some blocks 
    // then nothing updates blockToPop after gravity
    if(!this.isLocationInGrid(target)) {
      this.hoverCache = null;
      this.blocksToPop = [];
      return;
    }
    if(this.hoverCache === null || target.row !== this.hoverCache.row || target.col !== this.hoverCache.col){
      const blocks = this.getFloodedCoordinates(target);
      this.blocksToPop = blocks.length > 1 ? blocks : [];
      this.hoverCache = target;
    }
  }

  mouseExit() {
    this.hoverCache = null;
    this.blocksToPop = [];
  }

  update() {
    if (this.needsgravity) {
      const grid = this.grid;
      for (let col = 0; col < grid[0].length; col++) {
        // Iterate over each row from bottom to top
        for (let row = grid.length - 1; row >= 0; row--) {
          // If the current block is empty, search for the nearest non-empty block above it
          if (grid[row][col] === null) {
            // Start searching from the current row and move upwards
            let aboveRow = row - 1;
            while (aboveRow >= 0) {
              // If a non-empty block is found, move it down to fill the empty space
              if (grid[aboveRow][col] !== null) {
                // Move the block down
                grid[row][col] = grid[aboveRow][col];
                // Set the original position to empty
                grid[aboveRow][col] = null;
                break; // Exit the loop once the block is moved
              }
              aboveRow--;
            }
          }
        }
      }
      // now move blocks to the left:
      for (let col = 0; col < this.gameSettings.numColumns; col++){
        if(this.numBlocksInColumn[col] == 0) {
          // move the column to the left
          for (let c = col; c < this.gameSettings.numColumns; c++){
            for(let row = 0; row < this.gameSettings.numRows; row++){
              grid[row][c] = grid[row][c+1];
            }
          }
          this.numBlocksInColumn[col]=this.numBlocksInColumn[col+1];
        }
      }
      this.needsgravity = false;
    }
  }

  private isLocationInGrid(c: coordinate): boolean {
    return (
      c.row >= 0 &&
      c.row < this.gameSettings.numRows &&
      c.col >= 0 &&
      c.col < this.gameSettings.numColumns
    );
  }

  getFloodedCoordinates(
    coord: coordinate
  ): coordinate[] {
    const ret: coordinate[] = [];
    const visited: Set<string> = new Set();

    const target = this.grid[coord.row][coord.col];
    const fill = (c:coordinate): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${c.row},${c.col}`;

      if (!this.isLocationInGrid(c)) {
        return;
      }
      const block = this.grid[c.row][c.col];
      if (block==null || block !== target || visited.has(key)) {
        return;
      }
      ret.push(c);
      visited.add(key);
      fill({row: c.row + 1, col: c.col});
      fill({row: c.row - 1, col: c.col});
      fill({row: c.row, col: c.col + 1});
      fill({row: c.row, col: c.col - 1});
    };

    fill(coord);
    return ret;
  }
}
export default GameBoard;
