import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it, beforeAll } from 'vitest';

const distDir = join(import.meta.dirname, '..', 'dist');

beforeAll(() => {
  execSync('pnpm compile:esm', {
    cwd: join(import.meta.dirname, '..'),
    stdio: 'pipe',
  });
});

it('ESM dist files contain no @babel/core import specifier', () => {
  const jsFiles = readdirSync(distDir).filter(
    (f) => f.endsWith('.js') && !f.includes('cjs'),
  );
  expect(jsFiles.length).toBeGreaterThan(0);
  for (const file of jsFiles) {
    const content = readFileSync(join(distDir, file), 'utf8');
    expect(content, `${file} should not import @babel/core`).not.toMatch(
      /@babel\/core/,
    );
  }
});
