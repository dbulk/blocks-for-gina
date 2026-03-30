class StartOverlayView {
  readonly container: HTMLDivElement;
  private readonly panel: HTMLDivElement;
  private readonly startButton: HTMLButtonElement;

  constructor () {
    this.container = document.createElement('div');
    this.container.className = 'start-overlay-backdrop';

    this.panel = document.createElement('div');
    this.panel.className = 'start-overlay';

    const title = document.createElement('h1');
    title.className = 'start-overlay-title';
    title.textContent = 'Blocks4Gina';

    this.startButton = this.createStartButton();
    const credits = this.createCredits();

    this.panel.appendChild(title);
    this.panel.appendChild(this.startButton);
    this.panel.appendChild(credits);

    this.container.appendChild(this.panel);
  }

  setVisible (onoff: boolean): void {
    this.container.style.display = onoff ? 'flex' : 'none';
  }

  addStartClickListener (func: () => void): void {
    this.startButton.addEventListener('click', func, { once: true });
  }

  private createStartButton (): HTMLButtonElement {
    const startButton = document.createElement('button');
    startButton.className = 'start-overlay-play';
    startButton.textContent = 'PLAY';
    return startButton;
  }

  private createCredits (): HTMLDivElement {
    const credits = document.createElement('div');
    credits.className = 'start-overlay-meta-grid';
    credits.innerHTML = `
    <section class="start-overlay-meta-card">
      <h2>Source</h2>
      <p>Blocks4Gina by Dave Bulkin</p>
      <p>Released under <a href = "./LICENSE" target="_blank"  rel="noopener noreferrer">MIT License</a></p>
      <p><a href = "https://dave.bulkin.net" target="_blank" rel="noopener noreferrer">dave.bulkin.net</a></p>
      <p><a href = "https://github.com/dbulk/blocks-for-gina" target="_blank" rel="noopener noreferrer">github.com/dbulk/blocks-for-gina</a></p>
    </section>
    <section class="start-overlay-meta-card">
      <h2>Music</h2>
      <p>Permafrost by Scott Buckley</p>
      <p>Released under CC-BY 4.0</p>
      <p><a href = "https://www.scottbuckley.com.au" target="_blank" rel="noopener noreferrer">www.scottbuckley.com.au</a></p>
    </section>
    <section class="start-overlay-meta-card">
      <h2>Inspiration</h2>
      <p>Gina Mason</p>
      <p><a href = "https://ginamason.net" target="_blank" rel="noopener noreferrer">ginamason.net</a></p>
    </section>
    `;
    return credits;
  }
}

export default StartOverlayView;
