import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const coreDir = join(process.cwd(), 'src/core');
const allowedCoreExceptions = new Set(['gamecoordinator.ts', 'gamerunner.ts']);

const getCoreFiles = (): string[] =>
  readdirSync(coreDir)
    .filter((name) => name.endsWith('.ts'))
    .filter((name) => !allowedCoreExceptions.has(name));

describe('architecture boundaries', () => {
  it('core modules do not import presentation modules', () => {
    const offenders: string[] = [];

    for (const file of getCoreFiles()) {
      const filePath = join(coreDir, file);
      const content = readFileSync(filePath, 'utf8');
      if (content.includes("@/presentation/") || content.includes("'../presentation/") || content.includes('"../presentation/')) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
