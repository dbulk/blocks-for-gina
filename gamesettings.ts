
class GameSettings {
    numColumns!: number;
    numRows!: number;
    blockColors!: string[];
    numBlockTypes!: number;
    clusterStrength!: number;
    blockLabels!: boolean
      
    async loadSettings(filePath: string): Promise<void> {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Failed to fetch game settings');
            }
            const settings = await response.json();

            this.numColumns = settings.numColumns;
            this.numRows = settings.numRows;
            this.blockColors = settings.colors;
            this.numBlockTypes = this.blockColors.length;
            this.clusterStrength = settings.clusterStrength;            
            this.blockLabels = settings.blockLabels;
        } catch (error: any) {
            throw new Error('Error loading game settings: ' + error.message);
        }
    }

}

export default GameSettings;