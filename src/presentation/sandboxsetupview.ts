import { SANDBOX_MAX_BLOCK_TYPES, SANDBOX_MIN_BLOCK_TYPES } from '@/core/sandboxconstraints';

export interface SandboxConfig {
  numRows: number
  numColumns: number
  numBlockTypes: number
  clusterStrength: number
}

type SandboxStartListener = (config: SandboxConfig) => void;

function clampInt (value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampFloat (value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function makeField (labelText: string, id: string, input: HTMLInputElement): HTMLDivElement {
  const field = document.createElement('div');
  field.className = 'sandbox-field';
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = labelText;
  input.id = id;
  field.appendChild(label);
  field.appendChild(input);
  return field;
}

class SandboxSetupView {
  readonly container: HTMLDivElement;
  private readonly inputRows: HTMLInputElement;
  private readonly inputColumns: HTMLInputElement;
  private readonly inputBlockTypes: HTMLInputElement;
  private readonly inputCluster: HTMLInputElement;
  private readonly clusterValue: HTMLSpanElement;
  private listener: SandboxStartListener | null = null;

  constructor () {
    this.container = document.createElement('div');
    this.container.className = 'mode-select-backdrop';

    const panel = document.createElement('div');
    panel.className = 'mode-select-panel';

    const title = document.createElement('h2');
    title.className = 'sandbox-setup-title';
    title.textContent = 'Sandbox Setup';

    // Inputs
    this.inputRows = document.createElement('input');
    this.inputRows.type = 'number';
    this.inputRows.min = '5';
    this.inputRows.max = '40';
    this.inputRows.value = '10';
    this.inputRows.className = 'sandbox-number';

    this.inputColumns = document.createElement('input');
    this.inputColumns.type = 'number';
    this.inputColumns.min = '5';
    this.inputColumns.max = '60';
    this.inputColumns.value = '20';
    this.inputColumns.className = 'sandbox-number';

    this.inputBlockTypes = document.createElement('input');
    this.inputBlockTypes.type = 'number';
    this.inputBlockTypes.min = `${SANDBOX_MIN_BLOCK_TYPES}`;
    this.inputBlockTypes.max = `${SANDBOX_MAX_BLOCK_TYPES}`;
    this.inputBlockTypes.value = '5';
    this.inputBlockTypes.className = 'sandbox-number';

    this.inputCluster = document.createElement('input');
    this.inputCluster.type = 'range';
    this.inputCluster.min = '0';
    this.inputCluster.max = '1';
    this.inputCluster.step = '0.05';
    this.inputCluster.value = '0.2';
    this.inputCluster.className = 'sandbox-range';

    this.clusterValue = document.createElement('span');
    this.clusterValue.className = 'sandbox-cluster-value';
    this.updateClusterLabel();
    this.inputCluster.addEventListener('input', () => { this.updateClusterLabel(); });

    // Grid of fields
    const grid = document.createElement('div');
    grid.className = 'sandbox-grid';

    grid.appendChild(makeField('Rows', 'sandbox-rows', this.inputRows));
    grid.appendChild(makeField('Columns', 'sandbox-columns', this.inputColumns));
    grid.appendChild(makeField('Block types', 'sandbox-block-types', this.inputBlockTypes));

    const clusterField = document.createElement('div');
    clusterField.className = 'sandbox-field sandbox-field-cluster';
    const clusterLabel = document.createElement('label');
    clusterLabel.setAttribute('for', 'sandbox-cluster');
    clusterLabel.textContent = 'Clustering';
    this.inputCluster.id = 'sandbox-cluster';
    clusterField.appendChild(clusterLabel);
    clusterField.appendChild(this.inputCluster);
    clusterField.appendChild(this.clusterValue);
    grid.appendChild(clusterField);

    // Start button
    const startBtn = document.createElement('button');
    startBtn.className = 'mode-play-btn';
    startBtn.textContent = 'Start Game';
    startBtn.addEventListener('click', () => {
      if (this.listener) {
        this.listener(this.getConfig());
      }
    });

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'sandbox-back-btn';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => {
      if (this.backListener) {
        this.backListener();
      }
    });

    panel.appendChild(title);
    panel.appendChild(grid);
    panel.appendChild(startBtn);
    panel.appendChild(backBtn);
    this.container.appendChild(panel);
  }

  private backListener: (() => void) | null = null;

  setVisible (onoff: boolean): void {
    this.container.style.display = onoff ? 'flex' : 'none';
  }

  addStartListener (callback: SandboxStartListener): void {
    this.listener = callback;
  }

  addBackListener (callback: () => void): void {
    this.backListener = callback;
  }

  getConfig (): SandboxConfig {
    return {
      numRows: clampInt(this.inputRows.valueAsNumber, 5, 40),
      numColumns: clampInt(this.inputColumns.valueAsNumber, 5, 60),
      numBlockTypes: clampInt(this.inputBlockTypes.valueAsNumber, SANDBOX_MIN_BLOCK_TYPES, SANDBOX_MAX_BLOCK_TYPES),
      clusterStrength: clampFloat(this.inputCluster.valueAsNumber, 0, 1)
    };
  }

  private updateClusterLabel (): void {
    const pct = Math.round(clampFloat(this.inputCluster.valueAsNumber, 0, 1) * 100);
    this.clusterValue.textContent = `${pct}%`;
  }
}

export default SandboxSetupView;
