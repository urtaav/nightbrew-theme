import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, hueDistance } from '../lib/color.mjs';

test('contrastRatio follows WCAG 2.x', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF').toFixed(1), '21.0');
  assert.equal(contrastRatio('#FFFFFF', '#000000').toFixed(1), '21.0');
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1);
});

test('hueDistance takes the short way around the color wheel', () => {
  assert.equal(Math.round(hueDistance('#FF0000', '#00FF00')), 120);
  assert.ok(hueDistance('#FF0000', '#FF0080') <= 31);
  assert.ok(hueDistance('#FF0000', '#FF0080') >= 29);
});
