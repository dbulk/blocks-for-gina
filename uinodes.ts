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
  private readonly togMusic: HTMLButtonElement;
  private readonly togSound: HTMLButtonElement;
  private readonly expandButton: HTMLButtonElement;
  private readonly divSettings: HTMLDivElement;
  private readonly inputRows: HTMLInputElement;
  private readonly inputColumns: HTMLInputElement;
  private readonly inputClusterStrength: HTMLInputElement;
  private readonly inputColors: HTMLInputElement[];

  constructor () {
    this.div = document.createElement('div');
    this.cmdNewGame = document.createElement('button');
    this.togMusic = document.createElement('button');
    this.togSound = document.createElement('button');
    this.expandButton = document.createElement('button');
    this.divSettings = document.createElement('div');
    this.inputRows = document.createElement('input');
    this.inputColumns = document.createElement('input');
    this.inputClusterStrength = document.createElement('input');
    this.inputColors = [];
  }

  createUI (): void {
    this.div.style.display = 'flex';
    this.div.style.paddingTop = '10px';
    this.div.style.flexWrap = 'wrap';
    this.div.style.flexShrink = '1';
    setButtonProperties(this.cmdNewGame, 'New Game', false, this.div);
    setButtonProperties(this.togMusic, '🎵', true, this.div);
    setButtonProperties(this.togSound, '🔊', true, this.div);
    setButtonProperties(this.expandButton, 'Settings', true, this.div);
    setToggleState(this.expandButton, false);

    this.divSettings.className = 'settings-expandy';
    this.divSettings.style.display = 'flex';
    this.divSettings.style.alignContent = 'center';
    this.divSettings.style.flexWrap = 'wrap';
    this.divSettings.style.flexShrink = '1';
    

    this.div.appendChild(this.divSettings);

    {
      const d = document.createElement('div');
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignContent = 'center';
      d.style.flexWrap = 'none';
      this.divSettings.appendChild(d);
      d.appendChild(setInputProperties(this.inputRows, 'number', 'Rows:', 'rows', 5, 100, 10));
      d.appendChild(this.inputRows);
    }

    {
      const d = document.createElement('div');
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignContent = 'center';
      d.style.flexWrap = 'none';
      this.divSettings.appendChild(d);
      d.appendChild(setInputProperties(this.inputColumns, 'number', 'Columns:', 'columns', 5, 100, 20));
      d.appendChild(this.inputColumns);
    }

    {
      const d = document.createElement('div');
      this.divSettings.appendChild(d);
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignContent = 'center';
      d.style.flexWrap = 'none';
      d.appendChild(setInputProperties(this.inputClusterStrength, 'range', 'Clustering:', 'clusterstrength', 0, 1, 0.2));
      this.inputClusterStrength.step = '0.05';
      d.appendChild(this.inputClusterStrength);
    }

    {
      const d = document.createElement('div');
      d.style.display = 'flex';
      d.style.justifyContent = 'center';
      d.style.alignContent = 'center';
      d.style.flexWrap = 'none';
      this.divSettings.appendChild(d);
      makeColorInputs(this.inputColors, 5);

      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignContent = 'center';
      div.style.flexWrap = 'wrap';

      div.id = 'colors';
      const label = document.createElement('Label');
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
    this.inputRows.value = val.toString();
  }

  getInputRows (): number {
    return this.inputRows.valueAsNumber;
  }

  setInputColumns (val: number): void {
    this.inputColumns.value = val.toString();
  }

  getInputColumns (): number {
    return this.inputColumns.valueAsNumber;
  }

  setInputClusterStrength (val: number): void {
    this.inputClusterStrength.value = val.toString();
  }

  getInputClusterStrength (): number {
    return this.inputClusterStrength.valueAsNumber;
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
}

export default UINodes;
