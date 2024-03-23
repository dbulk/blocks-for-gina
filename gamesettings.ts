function makeButton(text:string, isToggle : boolean, div: HTMLDivElement){
    const button = document.createElement("button");
    button.textContent = text;
    if(isToggle){
        button.className="toggle";
        button.classList.add('active');        
        button.addEventListener('click', () => button.classList.toggle('active'));
    }
    div.appendChild(button);
    return button;
}

class GameSettings {
    numColumns!: number;
    numRows!: number;
    blockColors!: string[];
    numBlockTypes!: number;
    clusterStrength!: number;
    blockLabels!: boolean
      
    constructor(div : HTMLDivElement) {
        div.style.paddingTop = "10px";
        makeButton("New Game", false, div);
        makeButton("🎵", true, div);
        makeButton("🔊", true, div);
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