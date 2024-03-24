import GameState from "./gamestate.js"

import GameSettings from "./gamesettings.js";
import htmlInterface from "./htmlinterface.js";
import Renderer from "./renderer.js";


const MOVERATE = 0.15;
class GameRunner {
  renderer: Renderer;
  settings: GameSettings;
  gameState: GameState;
  canvas: HTMLCanvasElement;
  page: htmlInterface;
  audio: HTMLAudioElement;
  music: HTMLAudioElement;
  soundEnabled: boolean = true;

  constructor(renderer: Renderer, settings: GameSettings, page: htmlInterface) {
    this.renderer = renderer;
    this.settings = settings;
    this.audio = new Audio("./sound.wav");
    this.gameState = new GameState(this.playSoundEffect.bind(this));
    this.gameState.initializeGrid(settings.numRows, settings.numColumns, settings.numBlockTypes, settings.clusterStrength)

    renderer.setGameState(this.gameState);

    this.page = page;
    this.canvas = this.page.canvas as HTMLCanvasElement;
    this.attachListeners();

    this.music = new Audio("./scott-buckley-permafrost(chosic.com).mp3");
    this.music.loop = true;
    this.music.play();
    this.gameLoop();
    this.deserialize();

    
    if(this.soundEnabled){
      this.audio.play();
    }
    
    window.addEventListener("beforeunload", this.serialize.bind(this));
  }

  private gameLoop() {
    this.gameState.updateBlocks();

    if (this.gameState.animating) {
      requestAnimationFrame(() => this.animationLoop(performance.now()));
    }

    if (this.gameState.blocksDirty) {
      this.renderer.renderBlocks();
      this.renderer.renderPreview(this.gameState.popList);
      this.renderer.renderScoreBoard();
      this.gameState.blocksDirty = false;
    }

    // Schedule the next iteration of the game loop
    requestAnimationFrame(this.gameLoop.bind(this));

  }

  private animationLoop(startTime: number) {
    const elapsedTime = performance.now() - startTime;
    const numSteps = Math.floor(elapsedTime * MOVERATE);
    // increment startTime based on how much has been "used"
    startTime += numSteps / MOVERATE;
    let turnItOff = false;
    for (let step = 0; step < numSteps; step++) {
      turnItOff = !this.gameState.decrementOffsets(0.1);
    }

    this.renderer.renderBlocks();
    this.renderer.renderScoreBoard();
    if (turnItOff) {
      this.gameState.animating = false;
      this.gameState.blocksDirty = true;
    } else {
      requestAnimationFrame(() => this.animationLoop(startTime));
    }
  }

  private attachListeners() {
    this.canvas.addEventListener("click", this.gameState.doPop.bind(this.gameState));
    this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
      const coord = this.renderer.getGridIndicesFromMouse(event);
      this.gameState.updateSelection(coord);
    });
    this.canvas.addEventListener(
      "mouseleave",
      () => this.gameState.updateSelection({ row: -1, col: -1 })
    );

    this.settings.ui.cmdNewGame.addEventListener(
      "click",
      () => {
        this.settings.uiToSettings();
        this.gameState.initializeGrid(this.settings.numRows,this.settings.numColumns,this.settings.numBlockTypes, this.settings.clusterStrength);
        this.renderer.adjustCanvasSize();
      }
    );

    this.settings.ui.togMusic.addEventListener("click", () => {
      this.setAudioState();
    });

    this.settings.ui.togSound.addEventListener("click", () => {
      this.setAudioState()
    });

    for(const el of this.settings.ui.inputColors){
      el.addEventListener("input", ()=>{
        this.settings.uiColorsToSettings();
        this.gameState.blocksDirty=true;
      }
      );
    };

    this.settings.ui.expandButton.addEventListener("click", ()=>{
      if(this.settings.ui.expandButton.classList.contains("active")) {
        this.page.showSettingsDiv();
      } else {
        this.page.hideSettingsDiv();
      }
    });
  }

  private setAudioState() {
    this.settings.ui.togMusic.classList.contains("active") ? this.music.play() : this.music.pause();
    this.soundEnabled = this.settings.ui.togSound.classList.contains("active");
  }
  playSoundEffect() {
    if (this.soundEnabled) {
      this.audio.play();
    }
  }

  serialize() {
    // needs to serialize GameState and GameSettings
    const state = this.gameState.serialize();
    const settings = this.settings.serialize();
    localStorage.setItem("b4g", JSON.stringify({state, settings}));
  }

  deserialize() {
    const data = localStorage.getItem("b4g");
    if(data){
      const {state, settings} = JSON.parse(data);
      this.settings.deserialize(settings);
      this.gameState.deserialize(state);
      this.setAudioState();
      this.renderer.adjustCanvasSize();
    }
  }
}

export default GameRunner;
