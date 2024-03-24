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
    this.gameState.setGridSize(settings.numRows, settings.numColumns);
    this.gameState.initializeGrid(this.settings.numBlockTypes, this.settings.clusterStrength)

    renderer.setGameState(this.gameState);

    this.page = page;
    this.canvas = this.page.canvas as HTMLCanvasElement;
    this.attachListeners();

    this.music = new Audio("./scott-buckley-permafrost(chosic.com).mp3");
    this.music.loop = true;
    this.music.play();
    this.audio.play();
    this.gameLoop();
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

    this.settings.cmdNewGame.addEventListener(
      "click",
      () => this.gameState.initializeGrid(this.settings.numBlockTypes, this.settings.clusterStrength)
    );

    this.settings.togMusic.addEventListener("click", () => {
      if (this.settings.togMusic.classList.contains("active")) {
        this.music.play();
      } else {
        this.music.pause();
      }
    });

    this.settings.togSound.addEventListener("click", () => {
      this.soundEnabled = this.settings.togSound.classList.contains("active");
    });

    this.settings.cmdSerialize.addEventListener("click", ()=>{
      this.serialize();
    })
    this.settings.cmdDeserialize.addEventListener("click", ()=>{
      this.deserialize();
    })
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
      this.settings.blockColors = settings.blockColors;
      this.gameState.deserialize(state);
    }
    debugger;
  }
}

export default GameRunner;
