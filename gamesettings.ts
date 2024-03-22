import { buffer } from "stream/consumers";

class GameSettings {
    numColumns!: number;
    numRows!: number;
    blockColors!: string[];
    numBlockTypes!: number;
    clusterStrength!: number;
    blockLabels!: boolean
      
    constructor(div : HTMLDivElement) {
        div.style.paddingTop = "10px";
        // let's try making some nodes
        const button = document.createElement("button");
        button.textContent = "New Game";
        
        // Create a <style> element
const styleElement = document.createElement('style');

// // Define CSS rules
// styleElement.textContent = `
// `;

// // Append the <style> element to the <head> of the document
// document.head.appendChild(styleElement);
div.appendChild(button);

        // margin-top: 10px;
        // padding: 5px 10px;
        // border: none;
        // border-radius: 3px;
        // background-color: #007bff;
        // color: #fff;
        // cursor: pointer;
    }
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