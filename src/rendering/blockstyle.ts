const BLOCK_STYLES = ['Classic', 'Flat', 'Gloss', 'Neon', 'Matte', 'Pastel'] as const;

type BlockStyle = (typeof BLOCK_STYLES)[number];

const DEFAULT_BLOCK_STYLE: BlockStyle = 'Classic';

function isBlockStyle (value: unknown): value is BlockStyle {
  return typeof value === 'string' && (BLOCK_STYLES as readonly string[]).includes(value);
}

export { BLOCK_STYLES, DEFAULT_BLOCK_STYLE, isBlockStyle };
export type { BlockStyle };
