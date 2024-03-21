import GameSettings from "./gamesettings.js";

interface coordinate {
  row: number;
  col: number;
}

class GameBoard {
  private gameSettings: GameSettings;
  grid: (number | null)[][] = [];
  offsety: number[][] = [];
  offsetx: number[][] = [];
  doAnimation = false;
  numBlocksInColumn: number[] = [];
  needsPop = false;
  blocksToPop: coordinate[] = [];
  hoverCache: (coordinate | null) = null;
  score: number = 0;

  constructor(gameSettings: GameSettings) {
    this.gameSettings = gameSettings;
    this.initializeGrid();
  }

  click() {
    if (this.blocksToPop.length) {
      // Clicking just indicates that blocks should pop on the next update
      this.needsPop = true;
      this.score += this.computeScore(this.blocksToPop.length);
    }
  }

  hover(target: coordinate) {
    if (!this.isLocationInGrid(target)) {
      this.hoverCache = null;
      this.blocksToPop = [];
      return;
    }
    if (this.hoverCache === null || target.row !== this.hoverCache.row || target.col !== this.hoverCache.col) {
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
    if (this.needsPop) {
      const blocksToMove: Map<String, number> = new Map();

      for (const coord of this.blocksToPop) {
        this.grid[coord.row][coord.col] = null;
        // now add all rows less than this row to the map:
        for (let row = 0; row < coord.row; row++) {
          const key = `${row},${coord.col}`;
          const prevValue = blocksToMove.get(key);
          blocksToMove.set(key, prevValue ? prevValue + 1 : 1);
        }
        this.numBlocksInColumn[coord.col]--;
      }
      this.blocksToPop = [];
      const cursorLocation = this.hoverCache ? { row: this.hoverCache.row, col: this.hoverCache.col } : null;
      this.hoverCache = null;

      // Important to apply the move from bottom to top:
      for (let row = 0; row < this.gameSettings.numRows; row++) {
        this.offsety[row] = Array(this.gameSettings.numColumns).fill(0);
        this.offsetx[row] = Array(this.gameSettings.numColumns).fill(0);
      }
      for (let row = this.grid.length - 2; row >= 0; row--) {
        for (let col = 0; col < this.grid[0].length; col++) {
          const key = `${row},${col}`;
          const val = blocksToMove.get(key);
          if (val !== undefined) {
            this.grid[row + val][col] = this.grid[row][col];
            this.grid[row][col] = null;
            this.offsety[row+val][col] = val;
            this.doAnimation = true;
          }
        }
      }

      // now move blocks to the left:
      const leftShift = this.numBlocksInColumn.map((val) => val === 0).map((sum => value => sum += value ? 1 : 0)(0));

      for (let col = 1; col < this.gameSettings.numColumns; col++) {
        const mv = leftShift[col - 1];
        if (mv) {
          for (let row = 0; row < this.gameSettings.numRows; row++) {
            this.grid[row][col - mv] = this.grid[row][col];
            this.offsetx[row][col-mv] = mv;
            this.grid[row][col] = null;
          }
          this.numBlocksInColumn[col - mv] = this.numBlocksInColumn[col];
          this.numBlocksInColumn[col] = 0;
        }
      }
      this.needsPop = false;
      if (cursorLocation) {
        this.hover(cursorLocation);
      }
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

  private getFloodedCoordinates(
    coord: coordinate
  ): coordinate[] {
    const ret: coordinate[] = [];
    const visited: Set<string> = new Set();

    const target = this.grid[coord.row][coord.col];
    const fill = (c: coordinate): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${c.row},${c.col}`;

      if (!this.isLocationInGrid(c)) {
        return;
      }
      const block = this.grid[c.row][c.col];
      if (block == null || block !== target || visited.has(key)) {
        return;
      }
      ret.push(c);
      visited.add(key);
      fill({ row: c.row + 1, col: c.col });
      fill({ row: c.row - 1, col: c.col });
      fill({ row: c.row, col: c.col + 1 });
      fill({ row: c.row, col: c.col - 1 });
    };

    fill(coord);
    return ret;
  }

  computeScore(n: number): number {
    return 5 * (n ** 2 + 2 * n + (n > 12 ? n ** 3 : 0));
  }


  // initialize blocks
  initializeGrid() {
    for (let row = 0; row < this.gameSettings.numRows; row++) {
      this.grid[row] = Array(this.gameSettings.numColumns).fill(null);
      for (let col = 0; col < this.gameSettings.numColumns; col++) {
        let id = Math.floor(Math.random() * this.gameSettings.numBlockTypes);
        //const id = col % gameSettings.numBlockTypes
        if (Math.random() < this.gameSettings.clusterStrength && (row > 0 || col > 0)) {
          const neighbors = [];
          if (row > 0) neighbors.push({ row: row - 1, col: col });
          if (col > 0) neighbors.push({ row: row, col: col - 1 });
          if (row > 0 && col > 0) neighbors.push({ row: row - 1, col: col - 1 });
          const src = neighbors[Math.floor(Math.random() * neighbors.length)];
          const newid = this.grid[src.row][src.col]
          if (newid !== null) id = newid;

        }
        this.grid[row][col] = id;
      }
    }
    this.numBlocksInColumn = new Array(this.gameSettings.numColumns).fill(
      this.gameSettings.numRows
    );
    for (let row = 0; row < this.gameSettings.numRows; row++) {
      this.offsetx[row] = Array(this.gameSettings.numColumns).fill(0);
      this.offsety[row] = Array(this.gameSettings.numColumns).fill(0);
    }
  }
}
export default GameBoard;

