
class GameSettings {
    blockSize: number;
    numBlocksX: number;
    numBlocksY: number;
    blockColors: string[];
    numBlockTypes: number;


    constructor(
        blockSize: number,
        numBlocksX: number,
        numBlocksY: number,
        blockColors: string[]
      ) {
        this.blockSize = blockSize;
        this.numBlocksX = numBlocksX;
        this.numBlocksY = numBlocksY;
        this.blockColors = blockColors;
        this.numBlockTypes = blockColors.length;
      }
}

export default GameSettings;