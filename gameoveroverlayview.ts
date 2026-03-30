class GameOverOverlayView {
  readonly container: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly detail: HTMLDivElement;
  private readonly playAgainButton: HTMLButtonElement;

  constructor () {
    this.container = document.createElement('div');
    this.container.style.display = 'none';
    this.container.style.marginTop = '8px';
    this.container.style.padding = '10px 12px';
    this.container.style.border = '2px solid #0089b3';
    this.container.style.borderRadius = '8px';
    this.container.style.color = '#fff';
    this.container.style.userSelect = 'none';

    this.title = document.createElement('div');
    this.title.textContent = 'Game Over';
    this.title.style.fontSize = '24px';
    this.title.style.fontWeight = '700';

    this.detail = document.createElement('div');
    this.detail.style.marginTop = '4px';
    this.detail.style.fontSize = '14px';
    this.detail.style.color = '#d5f4ff';

    this.playAgainButton = document.createElement('button');
    this.playAgainButton.textContent = 'Play Again';
    this.playAgainButton.style.marginTop = '8px';

    this.container.appendChild(this.title);
    this.container.appendChild(this.detail);
    this.container.appendChild(this.playAgainButton);
  }

  setVisible (onoff: boolean): void {
    this.container.style.display = onoff ? 'block' : 'none';
  }

  setSummary (score: number, time: string, blocksRemaining: number): void {
    this.detail.textContent = `Score ${score} • Time ${time} • Blocks ${blocksRemaining}`;
  }

  addPlayAgainClickListener (func: () => void): void {
    this.playAgainButton.addEventListener('click', func);
  }
}

export default GameOverOverlayView;
