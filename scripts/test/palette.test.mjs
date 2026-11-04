import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadPalette, validatePalette } from '../lib/palette.mjs';

const sample = loadPalette('scripts/test/fixtures/sample.json');
const problems = (p) => validatePalette(p).join('\n');

test('every shipped palette passes validation', () => {
  const files = readdirSync('palettes').filter((f) => f.endsWith('.json'));
  assert.ok(files.length > 0, 'no palettes found');
  for (const f of files) assert.deepEqual(validatePalette(loadPalette(join('palettes', f))), [], f);
});

test('low-contrast syntax color is reported by key', () => {
  const bad = structuredClone(sample);
  bad.syntax.keyword = '#20232A';
  assert.match(problems(bad), /syntax\.keyword/);
});

test('non-hex value is reported', () => {
  const bad = structuredClone(sample);
  bad.syntax.keyword = 'pink';
  assert.match(problems(bad), /syntax\.keyword/);
});

test('missing role is reported', () => {
  const bad = structuredClone(sample);
  delete bad.syntax.type;
  assert.match(problems(bad), /syntax\.type/);
});

test('error too close in hue to keyword is reported', () => {
  const bad = structuredClone(sample);
  bad.status.error = '#FF7AB0';
  assert.match(problems(bad), /status\.error/);
});

test('dim comment below 3.5:1 is reported', () => {
  const bad = structuredClone(sample);
  bad.syntax.comment = '#3A3F4B';
  assert.match(problems(bad), /syntax\.comment/);
});
