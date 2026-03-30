type HudTone = 'default' | 'accent' | 'warning' | 'good';

interface HudMetric {
  key: string
  label: string
  value: string
  delta?: string
  tone?: HudTone
  order: number
  visible: boolean
}

export type { HudTone, HudMetric };
