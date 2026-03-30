import type { HudMetric } from './hudmetric';

interface MetricNodes {
  card: HTMLDivElement
  label: HTMLSpanElement
  value: HTMLSpanElement
  delta: HTMLSpanElement
}

class HudView {
  readonly div: HTMLDivElement;
  private readonly nodesByKey: Map<string, MetricNodes> = new Map<string, MetricNodes>();

  constructor () {
    this.div = document.createElement('div');
    this.div.style.display = 'grid';
    this.div.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    this.div.style.gap = '8px';
    this.div.style.marginBottom = '8px';
  }

  setVisibility (onoff: boolean): void {
    this.div.style.display = onoff ? 'grid' : 'none';
  }

  render (metrics: HudMetric[]): void {
    const visibleMetrics = metrics
      .filter((metric) => metric.visible)
      .sort((a, b) => a.order - b.order);

    const visibleKeys = new Set(visibleMetrics.map((metric) => metric.key));
    for (const [key, nodes] of this.nodesByKey) {
      if (!visibleKeys.has(key)) {
        nodes.card.remove();
        this.nodesByKey.delete(key);
      }
    }

    for (const metric of visibleMetrics) {
      let nodes = this.nodesByKey.get(metric.key);
      if (nodes === undefined) {
        nodes = this.createMetricCard();
        this.nodesByKey.set(metric.key, nodes);
      }

      nodes.label.textContent = metric.label;
      nodes.value.textContent = metric.value;
      nodes.delta.textContent = metric.delta ?? '';
      nodes.delta.style.display = metric.delta === undefined ? 'none' : 'inline';

      const tone = metric.tone ?? 'default';
      nodes.value.style.color = tone === 'accent' ? '#0089b3' : '#fff';
      nodes.delta.style.color = tone === 'accent' ? '#0089b3' : '#ccc';

      this.div.appendChild(nodes.card);
    }
  }

  private createMetricCard (): MetricNodes {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '2px';
    card.style.padding = '8px 12px';
    card.style.border = '1px solid #0089b3';
    card.style.borderRadius = '8px';

    const label = document.createElement('span');
    label.style.color = '#d5f4ff';
    label.style.fontSize = '12px';
    label.style.userSelect = 'none';

    const value = document.createElement('span');
    value.style.color = '#fff';
    value.style.fontSize = '24px';
    value.style.lineHeight = '1.1';
    value.style.userSelect = 'none';

    const delta = document.createElement('span');
    delta.style.color = '#ccc';
    delta.style.fontSize = '12px';
    delta.style.userSelect = 'none';

    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(delta);

    return { card, label, value, delta };
  }
}

export default HudView;
