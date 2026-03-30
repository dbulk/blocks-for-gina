class GameOverOverlayView {
  private readonly fadeDurationMs = 4000;
  readonly container: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly detail: HTMLDivElement;
  private readonly playAgainButton: HTMLButtonElement;

  constructor () {
    this.container = document.createElement('div');
    this.container.style.display = 'none';
    this.container.style.opacity = '0';
    this.container.style.transition = `opacity ${this.fadeDurationMs}ms ease, transform ${this.fadeDurationMs}ms ease`;
    this.container.style.position = 'absolute';
    this.container.style.left = '50%';
    this.container.style.top = '50%';
    this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
    this.container.style.width = 'min(90%, 420px)';
    this.container.style.padding = '10px 12px';
    this.container.style.border = '2px solid #0089b3';
    this.container.style.borderRadius = '8px';
    this.container.style.color = '#fff';
    this.container.style.textAlign = 'center';
    this.container.style.userSelect = 'none';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';

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
    this.playAgainButton.style.margin = '10px auto 0 auto';
    this.playAgainButton.style.display = 'block';

    this.container.appendChild(this.title);
    this.container.appendChild(this.detail);
    this.container.appendChild(this.playAgainButton);
  }

  setVisible (onoff: boolean): void {
    if (onoff) {
      this.container.style.display = 'block';
      this.container.style.opacity = '0';
      this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
      this.container.getBoundingClientRect();
      this.container.style.opacity = '1';
      this.container.style.transform = 'translate(-50%, -50%) scale(1)';
      return;
    }

    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
    window.setTimeout(() => {
      if (this.container.style.opacity === '0') {
        this.container.style.display = 'none';
      }
    }, this.fadeDurationMs);
  }

  setSummary (score: number, time: string, blocksRemaining: number): void {
    this.detail.textContent = `Score ${score} • Time ${time} • Blocks ${blocksRemaining}`;
  }

  addPlayAgainClickListener (func: () => void): void {
    this.playAgainButton.addEventListener('click', func);
  }
}

export default GameOverOverlayView;
