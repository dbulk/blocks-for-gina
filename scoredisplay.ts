class ScoreDisplay {
  readonly div: HTMLDivElement;
  private readonly blocks: HTMLSpanElement;
  private readonly time: HTMLSpanElement;
  private readonly score: HTMLSpanElement;

  constructor () {
    this.div = document.createElement('div');
    this.div.style.justifyContent = 'space-between';
    this.div.style.display = 'flex';

    this.blocks = document.createElement('span');
    this.div.appendChild(this.blocks);
    this.score = document.createElement('span');
    this.div.appendChild(this.score);
    this.time = document.createElement('span');
    this.div.appendChild(this.time);
  }

  setVisibility (onoff: boolean): void {
    this.div.style.display = onoff ? 'flex' : 'none';
  }

  setValues (blocks: string, time: string, score: string): void {
    this.blocks.innerHTML = blocks;
    this.time.textContent = time;
    this.score.innerHTML = score;
  }
}
export default ScoreDisplay;
