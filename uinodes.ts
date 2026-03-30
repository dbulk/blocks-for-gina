function setButtonProperties (button: HTMLButtonElement, text: string, isToggle: boolean, div: HTMLDivElement): HTMLButtonElement {
  button.textContent = text;
  if (isToggle) {
    button.className = 'toggle';
    button.classList.add('active');
    button.addEventListener('click', () => button.classList.toggle('active'));
  }

  button.style.userSelect = 'none';
  div.appendChild(button);
  return button;
}

function setInputProperties (input: HTMLInputElement,
  type: string,
  labelText: string,
  id: string,
  min: number,
  max: number,
  value: number): HTMLLabelElement {
  input.type = type;
  input.id = id;

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = labelText;

  input.min = min.toString();
  input.max = max.toString();
  input.value = value.toString();

  return label;
}

function makeColorInputs (
  inputArray: HTMLInputElement[],
  numcolors: number
): void {
  for (let i = 0; i < numcolors; ++i) {
    inputArray[i] = document.createElement('input');
    inputArray[i].type = 'color';
  }
}

function setToggleState (button: HTMLButtonElement, onoff: boolean): void {
  onoff ? button.classList.add('active') : button.classList.remove('active');
}
function getToggleState (button: HTMLButtonElement): boolean {
  return button.classList.contains('active');
}
class UINodes {
  private readonly div: HTMLDivElement;
  private readonly cmdNewGame: HTMLButtonElement;
  private readonly cmdUndo: HTMLButtonElement;
  private readonly cmdRedo: HTMLButtonElement;
  private readonly togMusic: HTMLButtonElement;
  private readonly togSound: HTMLButtonElement;
  private readonly expandButton: HTMLButtonElement;
  private readonly cmdApplySettings: HTMLButtonElement;
  private readonly cmdResetSettings: HTMLButtonElement;
  private readonly clusterValue: HTMLSpanElement;
  private readonly divSettings: HTMLDivElement;
  private readonly inputRows: HTMLInputElement;
  private readonly inputColumns: HTMLInputElement;
  private readonly inputClusterStrength: HTMLInputElement;
  private readonly inputColors: HTMLInputElement[];

  constructor () {
    this.div = document.createElement('div');
    this.cmdNewGame = document.createElement('button');
    this.cmdUndo = document.createElement('button');
    this.cmdRedo = document.createElement('button');
    this.togMusic = document.createElement('button');
    this.togSound = document.createElement('button');
    this.expandButton = document.createElement('button');
    this.cmdApplySettings = document.createElement('button');
    this.cmdResetSettings = document.createElement('button');
    this.clusterValue = document.createElement('span');
    this.divSettings = document.createElement('div');
    this.inputRows = document.createElement('input');
    this.inputColumns = document.createElement('input');
    this.inputClusterStrength = document.createElement('input');
    this.inputColors = [];
  }

  createUI (): void {
    this.div.className = 'ui-toolbar';
    setButtonProperties(this.cmdNewGame, 'New Game', false, this.div);
    setButtonProperties(this.cmdUndo, '↩', false, this.div);
    setButtonProperties(this.cmdRedo, '↪', false, this.div);
    setButtonProperties(this.togMusic, '🎵', true, this.div);
    setButtonProperties(this.togSound, '🔊', true, this.div);
    setButtonProperties(this.expandButton, 'Settings', true, this.div);
    setToggleState(this.expandButton, false);

    this.divSettings.className = 'settings-expandy settings-panel';
    this.divSettings.style.display = 'flex';
    this.divSettings.style.flexFlow = 'row wrap';

    this.div.appendChild(this.divSettings);

    const boardSection = this.createSettingsSection('Board');
    const generationSection = this.createSettingsSection('Generation');
    const appearanceSection = this.createSettingsSection('Appearance');
    const actionsSection = this.createSettingsSection('Actions');

    {
      const d = this.createSettingsRow(boardSection);
      d.classList.add('settings-row-grid');

      const rowsField = document.createElement('div');
      rowsField.className = 'settings-field';
      rowsField.appendChild(setInputProperties(this.inputRows, 'number', 'Rows', 'rows', 5, 100, 10));
      this.inputRows.className = 'settings-number';
      rowsField.appendChild(this.inputRows);

      const columnsField = document.createElement('div');
      columnsField.className = 'settings-field';
      columnsField.appendChild(setInputProperties(this.inputColumns, 'number', 'Columns', 'columns', 5, 100, 20));
      this.inputColumns.className = 'settings-number';
      columnsField.appendChild(this.inputColumns);

      d.appendChild(rowsField);
      d.appendChild(columnsField);
    }

    {
      const d = this.createSettingsRow(generationSection);
      d.appendChild(setInputProperties(this.inputClusterStrength, 'range', 'Clustering:', 'clusterstrength', 0, 1, 0.2));
      this.inputClusterStrength.step = '0.05';
      this.inputClusterStrength.className = 'settings-range';
      d.appendChild(this.inputClusterStrength);
      this.clusterValue.className = 'cluster-value';
      this.clusterValue.textContent = '20%';
      d.appendChild(this.clusterValue);
      this.inputClusterStrength.addEventListener('input', () => {
        this.updateClusterValue();
      });
    }

    {
      const d = this.createSettingsRow(actionsSection, true);
      d.classList.add('settings-row-inline');

      this.cmdApplySettings.textContent = 'Apply & New Game';
      this.cmdResetSettings.textContent = 'Reset Defaults';
      this.cmdApplySettings.className = 'settings-mini settings-primary';
      this.cmdResetSettings.className = 'settings-mini';
      d.appendChild(this.cmdApplySettings);
      d.appendChild(this.cmdResetSettings);
    }

    {
      const d = this.createSettingsRow(appearanceSection);
      makeColorInputs(this.inputColors, 5);

      const div = document.createElement('div');
      div.className = 'settings-colors';

      div.id = 'colors';
      const label = document.createElement('label');
      label.setAttribute('for', div.id);
      label.textContent = 'Colors:';
      for (const i of this.inputColors) {
        div.appendChild(i);
      }
      d.appendChild(label);
      d.appendChild(div);
    }

    this.expandButton.addEventListener('click', () => {
      this.setSettingsVisibility(getToggleState(this.expandButton));
    });

    this.setSettingsVisibility(false);
    this.updateClusterValue();
  }

  private setSettingsVisibility (onoff: boolean): void {
    this.divSettings.style.display = onoff ? 'flex' : 'none';
  }

  setVisibility (onoff: boolean): void {
    this.div.style.display = onoff ? 'block' : 'none';
  }

  setParent (div: HTMLDivElement): void {
    div.appendChild(this.div);
  }

  addNewGameClickListener (func: () => void): void {
    this.cmdNewGame.addEventListener('click', func);
  }

  addUndoListener (func: () => void): void {
    this.cmdUndo.addEventListener('click', func);
  }

  addRedoListener (func: () => void): void {
    this.cmdRedo.addEventListener('click', func);
  }

  addTogMusicClickListener (func: () => void): void {
    this.togMusic.addEventListener('click', func);
  }

  addTogSoundClickListener (func: () => void): void {
    this.togSound.addEventListener('click', func);
  }

  addInputColorsInputListener (func: () => void): void {
    for (const el of this.inputColors) {
      el.addEventListener('input', func);
    }
  }

  addApplySettingsListener (func: () => void): void {
    this.cmdApplySettings.addEventListener('click', func);
  }

  addResetSettingsListener (func: () => void): void {
    this.cmdResetSettings.addEventListener('click', func);
  }

  setTogMusic (onoff: boolean): void {
    setToggleState(this.togMusic, onoff);
  }

  getTogMusic (): boolean {
    return getToggleState(this.togMusic);
  }

  setTogSound (onoff: boolean): void {
    setToggleState(this.togSound, onoff);
  }

  getTogSound (): boolean {
    return getToggleState(this.togSound);
  }

  setInputRows (val: number): void {
    this.inputRows.value = this.clampInt(val, 5, 100).toString();
  }

  getInputRows (): number {
    return this.clampInt(this.inputRows.valueAsNumber, 5, 100);
  }

  setInputColumns (val: number): void {
    this.inputColumns.value = this.clampInt(val, 5, 100).toString();
  }

  getInputColumns (): number {
    return this.clampInt(this.inputColumns.valueAsNumber, 5, 100);
  }

  setInputClusterStrength (val: number): void {
    this.inputClusterStrength.value = this.clampFloat(val, 0, 1).toString();
    this.updateClusterValue();
  }

  getInputClusterStrength (): number {
    return this.clampFloat(this.inputClusterStrength.valueAsNumber, 0, 1);
  }

  setInputColors (vals: string[]): void {
    for (let i = 0; i < vals.length; ++i) {
      this.inputColors[i].value = vals[i];
    }
  }

  getInputColors (output: string[]): void {
    for (let i = 0; i < this.inputColors.length; ++i) {
      output[i] = this.inputColors[i].value;
    }
  };

  setUndoEnabled (yesno: boolean): void {
    this.cmdUndo.disabled = !yesno;
  }

  setRedoEnabled (yesno: boolean): void {
    this.cmdRedo.disabled = !yesno;
  }

  private clampInt (value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      return min;
    }
    const rounded = Math.round(value);
    return Math.min(max, Math.max(min, rounded));
  }

  private clampFloat (value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.min(max, Math.max(min, value));
  }

  private updateClusterValue (): void {
    const pct = Math.round(this.getInputClusterStrength() * 100);
    this.clusterValue.textContent = `${pct}%`;
  }

  private createSettingsSection (title: string): HTMLDivElement {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const heading = document.createElement('div');
    heading.className = 'settings-section-title';
    heading.textContent = title;
    section.appendChild(heading);

    const body = document.createElement('div');
    body.className = 'settings-section-body';
    section.appendChild(body);

    this.divSettings.appendChild(section);
    return body;
  }

  private createSettingsRow (parent: HTMLDivElement, wrap: boolean = false): HTMLDivElement {
    const row = document.createElement('div');
    row.className = wrap ? 'settings-row settings-row-wrap' : 'settings-row';
    parent.appendChild(row);
    return row;
  }
}

export default UINodes;
