import type { GameMode } from '@/core/moderegistry';

type ModeSelectListener = (modeId: string) => void;

class ModeSelectView {
  readonly container: HTMLDivElement;
  private selectedModeId: string = 'arcade';
  private readonly toggleButtons: HTMLButtonElement[] = [];
  private readonly toggleRow: HTMLDivElement;
  private listener: ModeSelectListener | null = null;

  constructor () {
    this.container = document.createElement('div');
    this.container.className = 'mode-select-backdrop';

    const panel = document.createElement('div');
    panel.className = 'mode-select-panel';

    const title = document.createElement('h1');
    title.className = 'mode-select-title';
    title.textContent = 'Blocks4Gina';

    this.toggleRow = document.createElement('div');
    this.toggleRow.className = 'mode-toggles';

    const playBtn = document.createElement('button');
    playBtn.className = 'mode-play-btn';
    playBtn.textContent = 'Play';
    playBtn.addEventListener('click', () => {
      if (this.listener) {
        this.listener(this.selectedModeId);
      }
    });

    const credits = this.createCredits();

    const playSection = document.createElement('div');
    playSection.className = 'mode-select-section';
    playSection.appendChild(playBtn);

    const modeSection = document.createElement('div');
    modeSection.className = 'mode-select-section';
    modeSection.appendChild(this.toggleRow);

    const creditsSection = document.createElement('div');
    creditsSection.className = 'mode-select-section';
    creditsSection.appendChild(credits);

    panel.appendChild(title);
    panel.appendChild(playSection);
    panel.appendChild(modeSection);
    panel.appendChild(creditsSection);
    this.container.appendChild(panel);
  }

  setModes (modes: GameMode[]): void {
    this.toggleRow.innerHTML = '';
    this.toggleButtons.length = 0;

    const playable = modes.filter(m => m.implemented);
    const upcoming = modes.filter(m => !m.implemented);

    for (const mode of playable) {
      const btn = this.createModeToggle(mode);
      this.toggleButtons.push(btn);
      this.toggleRow.appendChild(btn);
    }

    if (upcoming.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'mode-toggles-divider';
      divider.textContent = 'Coming Soon';
      this.toggleRow.appendChild(divider);

      for (const mode of upcoming) {
        const btn = this.createModeToggle(mode);
        btn.disabled = true;
        this.toggleRow.appendChild(btn);
      }
    }

    if (!this.toggleButtons.some(b => b.dataset.modeId === this.selectedModeId)) {
      this.selectedModeId = this.toggleButtons[0]?.dataset.modeId ?? 'arcade';
    }
    this.updateSelection();
  }

  setVisible (onoff: boolean): void {
    this.container.style.display = onoff ? 'flex' : 'none';
  }

  addModeCardClickListener (callback: ModeSelectListener): void {
    this.listener = callback;
  }

  private createModeToggle (mode: GameMode): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'mode-toggle';
    btn.textContent = mode.name;
    btn.title = mode.description;
    btn.dataset.modeId = mode.id;
    btn.addEventListener('click', () => {
      this.selectedModeId = mode.id;
      this.updateSelection();
    });
    return btn;
  }

  private updateSelection (): void {
    for (const btn of this.toggleButtons) {
      btn.classList.toggle('selected', btn.dataset.modeId === this.selectedModeId);
    }
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
