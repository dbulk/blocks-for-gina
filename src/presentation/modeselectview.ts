type ModeCardClickListener = (modeId: string) => void;

interface ModeCardSpec {
  id: string;
  name: string;
  description: string;
}

const PRIMARY_MODES: ModeCardSpec[] = [
  {
    id: 'arcade',
    name: 'Arcade',
    description: 'Fixed board, competitive scoring. Compare your best runs and climb the leaderboard.'
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    description: 'Custom board size and generation settings. Explore freely with no pressure.'
  }
];

class ModeSelectView {
  readonly container: HTMLDivElement;
  private readonly modeCards: HTMLDivElement;
  private listener: ModeCardClickListener | null = null;

  constructor () {
    this.container = document.createElement('div');
    this.container.className = 'mode-select-backdrop';

    const panel = document.createElement('div');
    panel.className = 'mode-select-panel';

    const title = document.createElement('h1');
    title.className = 'mode-select-title';
    title.textContent = 'Blocks4Gina';

    const subtitle = document.createElement('p');
    subtitle.className = 'mode-select-subtitle';
    subtitle.textContent = 'Choose how you want to play.';

    this.modeCards = document.createElement('div');
    this.modeCards.className = 'mode-cards';

    for (const mode of PRIMARY_MODES) {
      this.modeCards.appendChild(this.createModeCard(mode));
    }

    const credits = this.createCredits();

    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(this.modeCards);
    panel.appendChild(credits);
    this.container.appendChild(panel);
  }

  setVisible (onoff: boolean): void {
    this.container.style.display = onoff ? 'flex' : 'none';
  }

  addModeCardClickListener (callback: ModeCardClickListener): void {
    this.listener = callback;
  }

  private createModeCard (mode: ModeCardSpec): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'mode-card';

    const title = document.createElement('h2');
    title.className = 'mode-card-title';
    title.textContent = mode.name;

    const desc = document.createElement('p');
    desc.className = 'mode-card-desc';
    desc.textContent = mode.description;

    const playBtn = document.createElement('button');
    playBtn.className = 'mode-card-play';
    playBtn.textContent = `Play ${mode.name}`;
    playBtn.dataset.modeId = mode.id;
    playBtn.addEventListener('click', () => {
      if (this.listener) {
        this.listener(mode.id);
      }
    });

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(playBtn);
    return card;
  }

  private createCredits (): HTMLDivElement {
    const credits = document.createElement('div');
    credits.className = 'start-overlay-meta-grid';
    credits.innerHTML = `
    <section class="start-overlay-meta-card">
      <h2>Source</h2>
      <p>Blocks4Gina by Dave Bulkin</p>
      <p>Released under <a href="./LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a></p>
      <p><a href="https://dave.bulkin.net" target="_blank" rel="noopener noreferrer">dave.bulkin.net</a></p>
      <p><a href="https://github.com/dbulk/blocks-for-gina" target="_blank" rel="noopener noreferrer">github.com/dbulk/blocks-for-gina</a></p>
    </section>
    <section class="start-overlay-meta-card">
      <h2>Music</h2>
      <p>Permafrost by Scott Buckley</p>
      <p>Released under CC-BY 4.0</p>
      <p><a href="https://www.scottbuckley.com.au" target="_blank" rel="noopener noreferrer">www.scottbuckley.com.au</a></p>
    </section>
    <section class="start-overlay-meta-card">
      <h2>Inspiration</h2>
      <p>Gina Mason</p>
      <p><a href="https://ginamason.net" target="_blank" rel="noopener noreferrer">ginamason.net</a></p>
    </section>
    `;
    return credits;
  }
}

export default ModeSelectView;
