
class GameSettings {
    blockSize!: number;
    numColumns!: number;
    numRows!: number;
    blockColors!: string[];
    numBlockTypes!: number;
      
    async loadSettings(filePath: string): Promise<void> {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Failed to fetch game settings');
            }
            const settings = await response.json();

            this.blockSize = settings.blockSize;
            this.numColumns = settings.numColumns;
            this.numRows = settings.numRows;
            this.blockColors = settings.colors;
            this.numBlockTypes = this.blockColors.length;            
        } catch (error: any) {
            throw new Error('Error loading game settings: ' + error.message);
        }
    }

}

export default GameSettings;