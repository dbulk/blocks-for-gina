interface item {
  id: number | null;
  xoffset: number;
  yoffset: number;
}
interface coordinate {
  row: number;
  col: number;
}
const isEqual = (a: coordinate, b: coordinate): boolean =>
  a.row == b.row && a.col == b.col;

class GameState {
  private grid: item[][] = [];
  private popList: coordinate[] = [];
  private blocksDirty = true;
  private animating = true;
  private score: number = 0;
  private numBlocksInColumn: number[] = [];

  private numRows: number = 0;
  private numColumns: number = 0;
  private selectionCache: coordinate;

  constructor() {}

  setGridSize(numRows: number, numColumns: number) {
    this.numRows = numRows;
    this.numColumns = numColumns;
  }

  getScore(): number {
    return this.score;
  }
  resetScore() {
    this.score = 0;
  }

  initializeGrid(numBlockTypes: number, clusterStrength: number) {
    for (let row = 0; row < this.numRows; row++) {
      this.grid[row] = Array(this.numColumns);
      for (let col = 0; col < this.numColumns; col++) {
        const currentItem = this.grid[row][col];
        currentItem.id = Math.floor(Math.random() * numBlockTypes);
        if ((row > 0 || col > 0) && Math.random() < clusterStrength) {
          const neighbors = [];
          if (row > 0) neighbors.push({ row: row - 1, col: col });
          if (col > 0) neighbors.push({ row: row, col: col - 1 });
          if (row > 0 && col > 0)
            neighbors.push({ row: row - 1, col: col - 1 });
          const src = neighbors[Math.floor(Math.random() * neighbors.length)];
          currentItem.id = this.grid[src.row][src.col].id;
        }
        currentItem.xoffset = 0;
        currentItem.yoffset = 0;
      }
    }
    this.numBlocksInColumn = new Array(this.numColumns).fill(this.numRows);
  }

  getBlockID(c: coordinate): number | null {
    return this.grid[c.row][c.col].id;
  }

  getBlockOffset(c: coordinate) {
    const item = this.grid[c.row][c.col];
    return { x: item.xoffset, y: item.yoffset };
  }

  updateSelection(target: coordinate) {
    if (!this.isLocationInGrid(target)) {
      target = { row: -1, col: -1 };
      this.popList = [];
    } else if (!isEqual(target, this.selectionCache)) {
      const blocks = this.getFloodedCoordinates(target);
      this.popList = blocks.length > 1 ? blocks : [];
    }
    if (!isEqual(target, this.selectionCache)) {
      this.blocksDirty = true;
    }
    this.selectionCache = target;
  }

  private getFloodedCoordinates(coord: coordinate): coordinate[] {
    const ret: coordinate[] = [];
    const visited: Set<string> = new Set();

    const target = this.grid[coord.row][coord.col].id;
    const fill = (c: coordinate): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${c.row},${c.col}`;

      if (!this.isLocationInGrid(c)) {
        return;
      }
      const block = this.grid[c.row][c.col].id;
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
  
  private isLocationInGrid(c: coordinate): boolean {
    return (
      c.row >= 0 &&
      c.row < this.numRows &&
      c.col >= 0 &&
      c.col < this.numColumns
    );
  }
}
