class ScoreDisplay {
  readonly div: HTMLDivElement;
  private readonly blocks: HTMLSpanElement;
  private readonly time: HTMLSpanElement;
  private readonly score: HTMLSpanElement;

  constructor () {
    this.div = document.createElement('div');
    // this.div.style.justifyContent = 'space-between';
    // this.div.style.display = 'flex';

    const tbl = document.createElement('table');
    tbl.style.width = '100%';
    this.div.appendChild(tbl);

    const row = tbl.insertRow();

    this.blocks = document.createElement('span');
    this.score = document.createElement('span');
    this.time = document.createElement('span');

    const cell = [row.insertCell(), row.insertCell(), row.insertCell()]; 
    cell[0].appendChild(this.blocks);
    cell[1].appendChild(this.score);
    cell[2].appendChild(this.time);

    cell.forEach(c => { c.style.width = '33.33%'; });
    cell[1].style.textAlign = 'center';
    cell[2].style.textAlign = 'right';
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
