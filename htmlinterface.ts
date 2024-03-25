import styleElement from './gamestyle.js';

// todo: put this somewhere (maybe it's even a class to make it easier to manip?)
interface uinodes {
  div: HTMLDivElement
  cmdNewGame: HTMLButtonElement
  togMusic: HTMLButtonElement
  togSound: HTMLButtonElement
  expandButton: HTMLButtonElement
  divSettings: HTMLDivElement
  inputRows: HTMLInputElement
  inputColumns: HTMLInputElement
  inputClusterStrength: HTMLInputElement
  inputColors: HTMLInputElement[]
}

function makeButton (text: string, isToggle: boolean, div: HTMLDivElement): HTMLButtonElement {
  const button = document.createElement('button');
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

function makeInput (
  type: string,
  labelText: string,
  id: string,
  min: number,
  max: number,
  value: number,
  div: HTMLDivElement,
  step: number = 1
): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.id = id;

  const label = document.createElement('Label');
  label.setAttribute('for', id);
  label.textContent = labelText;

  input.min = min.toString();
  input.max = max.toString();
  input.step = step.toString();
  input.value = value.toString();

  div.appendChild(label);
  div.appendChild(input);
  return input;
}

function makeColorInputs (
  labelText: string,
  id: string,
  numcolors: number,
  div: HTMLDivElement
): HTMLInputElement[] {
  const subDiv = document.createElement('div');
  div.id = id;

  const label = document.createElement('Label');
  label.setAttribute('for', id);
  label.textContent = labelText;

  const colorInputs = [];
  for (let i = 0; i < numcolors; ++i) {
    colorInputs[i] = document.createElement('input');
    colorInputs[i].type = 'color';
    subDiv.appendChild(colorInputs[i]);
  }

  subDiv.style.display = 'inline-block';
  div.appendChild(label);
  div.appendChild(subDiv);

  return colorInputs;
}

class HTMLInterface {
  canvas!: HTMLCanvasElement;
  ui!: uinodes;
  isvalid = false;
  startButton!: HTMLButtonElement;
  credits!: HTMLDivElement;

  constructor () {
    document.head.appendChild(styleElement);
    const divTarget = document.getElementById('Blocks4Gina');
    if (divTarget === null) {
      console.error('no div for game found');
      return;
    }
    this.isvalid = true;
    divTarget.style.display = 'flex';
    divTarget.style.justifyContent = 'center';
    divTarget.style.alignItems = 'start';
    divTarget.style.height = '100%';

    const div = document.createElement('div');
    div.className = 'blocks4Gina';
    (divTarget).appendChild(div);

    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '2px solid';
    this.canvas.style.display = 'block';

    this.ui = this.createUI();
    this.createStartButton();
    this.createCredits();

    div.appendChild(this.canvas);
    div.appendChild(this.startButton);
    div.appendChild(this.credits);
    div.appendChild(this.ui.div);
    this.hideControls();
  }

  showControls (): void {
    this.ui.div.style.display = 'block';
  }

  hideControls (): void {
    this.ui.div.style.display = 'none';
  }

  hideStartButton (): void {
    this.startButton.style.display = 'none';
    this.credits.style.display = 'none';
  }

  hideSettingsDiv (): void {
    this.ui.divSettings.style.display = 'none';
  }

  showSettingsDiv (): void {
    this.ui.divSettings.style.display = 'inline-block';
  }

  resize (): void {
    if (!this.startButton.hidden) {
      this.startButton.style.top = `-${this.canvas.height / 2}px`;
    }
  }

  private createUI (): uinodes {
    const div = document.createElement('div');
    div.style.display = 'block';
    div.style.paddingTop = '10px';

    const cmdNewGame = makeButton('New Game', false, div);
    const togMusic = makeButton('🎵', true, div);
    const togSound = makeButton('🔊', true, div);

    // Now we want an expandy thingy
    const expandButton = makeButton('Settings', true, div);
    expandButton.className = 'toggle';
    const divSettings = document.createElement('div');
    divSettings.className = 'settings-expandy';
    div.appendChild(divSettings);
    divSettings.style.display = 'none';

    const inputRows = makeInput(
      'number',
      'Rows:',
      'rows',
      5,
      200,
      10,
      divSettings
    );
    const inputColumns = makeInput(
      'number',
      'Columns:',
      'columns',
      5,
      200,
      20,
      divSettings
    );
    const inputClusterStrength = makeInput(
      'range',
      'Clustering:',
      'clusterstrength',
      0,
      1,
      0.2,
      divSettings,
      0.1
    );
    const inputColors = makeColorInputs('Colors:', 'colors', 5, divSettings);
    return {
      div,
      cmdNewGame,
      togMusic,
      togSound,
      expandButton,
      divSettings,
      inputRows,
      inputColumns,
      inputClusterStrength,
      inputColors
    };
  }

  private createStartButton (): void {
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'PLAY';
    this.startButton.style.padding = '15px 18px';
    this.startButton.style.position = 'relative';
    this.startButton.style.left = '50%';
    this.startButton.style.transform = 'translate(-50%, -50%)';
    this.startButton.style.display = 'block';
  }

  private createCredits (): void {
    this.credits = document.createElement('div');
    this.credits.innerHTML = `
    <table>
    <tr style="vertical-align: top">

    <td>
    <p><b>Source</b></p>
    <p>Blocks4Gina by Dave Bulkin</p>
    <p>Released under <a href = "./LICENSE" target="_blank"  rel="noopener noreferrer">MIT License</a></p>
    <p><a href = "https://dave.bulkin.net" target="_blank">dave.bulkin.net</a></p>
    <p><a href = "https://github.com/dbulk/blocks-for-gina" target="_blank">git</a></p>
    </td>
    <td>
    <p><b>Music</b></p>
    <p>Permafrost by Scott Buckley<br>
    <p>Released under CC-BY 4.0</p>
    <p><a href = "https://www.scottbuckley.com.au" target="_blank">www.scottbuckley.com.au</a></p>
    </td>
    <td>
    <p><b>Inspiration</b></p>
    <p>Gina Mason</p>
    <p><a href = "https://ginamason.net" target="_blank">ginamason.net</a></p>
    </td>
    </tr>
    </table>
    `;
    this.credits.style.display = 'inline';
    this.credits.style.position = 'relative';
    this.credits.style.top = '-150px';
    this.credits.style.userSelect = 'none';
  }
}

export default HTMLInterface;
