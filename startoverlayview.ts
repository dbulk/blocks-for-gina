class StartOverlayView {
  readonly container: HTMLDivElement;
  private readonly startButton: HTMLButtonElement;
  private readonly credits: HTMLDivElement;

  constructor () {
    this.container = document.createElement('div');
    this.container.style.position = 'relative';

    this.startButton = this.createStartButton();
    this.credits = this.createCredits();

    this.container.appendChild(this.startButton);
    this.container.appendChild(this.credits);
  }

  setVisible (onoff: boolean): void {
    this.startButton.style.display = onoff ? 'block' : 'none';
    this.credits.style.display = onoff ? 'inline' : 'none';
  }

  setCanvasHeight (height: number): void {
    this.startButton.style.top = `-${height / 2}px`;
  }

  addStartClickListener (func: () => void): void {
    this.startButton.addEventListener('click', func, { once: true });
  }

  private createStartButton (): HTMLButtonElement {
    const startButton = document.createElement('button');
    startButton.textContent = 'PLAY';
    startButton.style.padding = '15px 18px';
    startButton.style.position = 'relative';
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.display = 'block';
    return startButton;
  }

  private createCredits (): HTMLDivElement {
    const credits = document.createElement('div');
    credits.innerHTML = `
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
    credits.style.display = 'inline';
    credits.style.position = 'relative';
    credits.style.top = '-150px';
    credits.style.userSelect = 'none';
    return credits;
  }
}

export default StartOverlayView;
