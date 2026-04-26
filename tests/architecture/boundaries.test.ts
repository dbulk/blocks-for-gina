import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const coreDir = join(process.cwd(), 'src/core');
const allowedCoreExceptions = new Set(['gamecoordinator.ts', 'gamerunner.ts', 'userpreferences.ts']);

const forbiddenImportsByLayer = [
  '@/presentation/',
  '@/rendering/',
  '@/bootstrap/',
  '../presentation/',
  '../rendering/',
  '../bootstrap/'
];

const getCoreFiles = (): string[] =>
  readdirSync(coreDir)
    .filter((name) => name.endsWith('.ts'))
    .filter((name) => !allowedCoreExceptions.has(name));

describe('architecture boundaries', () => {
  it('core modules keep framework and UI layers out of domain files', () => {
    const offenders: string[] = [];

    for (const file of getCoreFiles()) {
      const filePath = join(coreDir, file);
      const content = readFileSync(filePath, 'utf8');
      const hasForbiddenImport = forbiddenImportsByLayer.some((token) => content.includes(token));
      if (hasForbiddenImport) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
