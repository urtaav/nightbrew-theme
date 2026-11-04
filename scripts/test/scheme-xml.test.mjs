import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPalette } from '../lib/palette.mjs';
import { contrastRatio } from '../lib/color.mjs';
import { renderSchemeXml } from '../lib/scheme-xml.mjs';

const p = loadPalette('scripts/test/fixtures/sample.json');
const x = renderSchemeXml(p);
const hex = (c) => c.slice(1).toUpperCase();
const attr = (name) => {
  const esc = name.replace(/\./g, '\\.');
  return x.match(new RegExp(`<option name="${esc}">[\\s\\S]*?</option>`))?.[0] ?? '';
};
const fg = (name) => attr(name).match(/name="FOREGROUND" value="([0-9A-F]{6})"/)?.[1];

test('scheme header inherits Darcula', () => {
  assert.match(x, /^<scheme name="Nightbrew Sample" parent_scheme="Darcula" version="142">/);
});

test('core syntax roles map to palette colors', () => {
  assert.equal(fg('DEFAULT_KEYWORD'), hex(p.syntax.keyword));
  assert.equal(fg('DEFAULT_FUNCTION_CALL'), hex(p.syntax.function));
  assert.equal(fg('DEFAULT_STRING'), hex(p.syntax.string));
  assert.equal(fg('DEFAULT_NUMBER'), hex(p.syntax.number));
  assert.equal(fg('DEFAULT_CLASS_NAME'), hex(p.syntax.type));
  assert.equal(fg('DEFAULT_PARAMETER'), hex(p.syntax.parameter));
});

test('comments are italic', () => {
  for (const k of ['DEFAULT_LINE_COMMENT', 'DEFAULT_BLOCK_COMMENT', 'DEFAULT_DOC_COMMENT']) {
    assert.match(attr(k), /name="FONT_TYPE" value="2"/, k);
  }
});

test('languages that skip DEFAULT_* keys are themed', () => {
  for (const k of ['MARKDOWN_HEADER_LEVEL_1', 'JSON.PROPERTY_KEY', 'YAML_SCALAR_KEY', 'XML_TAG_NAME', 'HTML_TAG_NAME', 'HTML_ATTRIBUTE_NAME']) {
    assert.ok(fg(k), k);
  }
});

test('all 16 ANSI console colors exist and are readable', () => {
  const names = ['BLACK', 'RED', 'GREEN', 'YELLOW', 'BLUE', 'MAGENTA', 'CYAN', 'GRAY', 'DARKGRAY',
    'RED_BRIGHT', 'GREEN_BRIGHT', 'YELLOW_BRIGHT', 'BLUE_BRIGHT', 'MAGENTA_BRIGHT', 'CYAN_BRIGHT', 'WHITE'];
  for (const n of names) {
    const c = fg(`CONSOLE_${n}_OUTPUT`);
    assert.ok(c, n);
    if (!['BLACK', 'DARKGRAY', 'GRAY'].includes(n)) assert.ok(contrastRatio(`#${c}`, p.ui.bg) >= 4.5, n);
  }
});

test('diff gutter uses status colors', () => {
  assert.match(x, new RegExp(`name="ADDED_LINES_COLOR" value="${hex(p.status.added)}"`));
  assert.match(x, new RegExp(`name="MODIFIED_LINES_COLOR" value="${hex(p.status.modified)}"`));
  assert.match(x, new RegExp(`name="DELETED_LINES_COLOR" value="${hex(p.status.deleted)}"`));
});

test('errors get a wave underline in the error color', () => {
  assert.match(attr('ERRORS_ATTRIBUTES'), new RegExp(`EFFECT_COLOR" value="${hex(p.status.error)}"`));
  assert.match(attr('ERRORS_ATTRIBUTES'), /EFFECT_TYPE" value="2"/);
});

test('no unresolved values leak into the xml', () => {
  assert.doesNotMatch(x, /undefined|NaN|null/);
});
