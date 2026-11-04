import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateAll } from '../generate.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'nightbrew-'));

test('writes a theme json and a scheme xml per palette', () => {
  const src = tmp();
  const out = tmp();
  copyFileSync('scripts/test/fixtures/sample.json', join(src, 'sample.json'));
  const written = generateAll(src, out);
  assert.equal(written.length, 2);
  assert.deepEqual(readdirSync(out).sort(), ['nightbrew_sample.theme.json', 'nightbrew_sample.xml']);
  assert.equal(JSON.parse(readFileSync(join(out, 'nightbrew_sample.theme.json'), 'utf8')).name, 'Nightbrew Sample');
});

test('refuses to generate from an invalid palette', () => {
  const src = tmp();
  const bad = JSON.parse(readFileSync('scripts/test/fixtures/sample.json', 'utf8'));
  bad.syntax.keyword = '#20232A';
  writeFileSync(join(src, 'bad.json'), JSON.stringify(bad));
  assert.throws(() => generateAll(src, tmp()), /syntax\.keyword/);
});

test('committed resources match the palettes (run node scripts/generate.mjs)', () => {
  const out = tmp();
  generateAll('palettes', out);
  for (const f of readdirSync(out)) {
    const committed = readFileSync(join('src/main/resources', f), 'utf8');
    assert.equal(committed, readFileSync(join(out, f), 'utf8'), `${f} is stale`);
  }
});
