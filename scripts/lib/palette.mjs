import { readFileSync } from 'node:fs';
import { contrastRatio, hueDistance } from './color.mjs';

const ROLES = {
  ui: ['bg', 'panel', 'line', 'selection', 'border', 'fg', 'fgMuted'],
  syntax: ['comment', 'keyword', 'function', 'string', 'number', 'type', 'parameter'],
  status: ['error', 'warning', 'added', 'modified', 'deleted'],
};

// Minimum contrast against the editor background, per the design spec.
const MIN_TEXT = 12;
const MIN_SYNTAX = 4.5;
const MIN_COMMENT = 3.5;
// Errors must not read as keywords when both are warm/pink.
const MIN_ERROR_KEYWORD_HUE = 18;

const HEX = /^#[0-9A-F]{6}$/i;

export function loadPalette(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function validatePalette(p) {
  const problems = [];
  for (const [group, keys] of Object.entries(ROLES)) {
    for (const key of keys) {
      const value = p[group]?.[key];
      if (!HEX.test(value ?? '')) problems.push(`${group}.${key}: expected #RRGGBB, got ${value}`);
    }
  }
  if (problems.length) return problems;

  const bg = p.ui.bg;
  const need = (path, value, min) => {
    const ratio = contrastRatio(value, bg);
    if (ratio < min) problems.push(`${path}: contrast ${ratio.toFixed(2)} < ${min}`);
  };

  need('ui.fg', p.ui.fg, MIN_TEXT);
  for (const key of ROLES.syntax) {
    need(`syntax.${key}`, p.syntax[key], key === 'comment' ? MIN_COMMENT : MIN_SYNTAX);
  }
  for (const key of ROLES.status) need(`status.${key}`, p.status[key], MIN_SYNTAX);

  const hd = hueDistance(p.status.error, p.syntax.keyword);
  if (hd < MIN_ERROR_KEYWORD_HUE) {
    problems.push(`status.error: hue ${hd.toFixed(1)}° from syntax.keyword < ${MIN_ERROR_KEYWORD_HUE}°`);
  }
  return problems;
}
