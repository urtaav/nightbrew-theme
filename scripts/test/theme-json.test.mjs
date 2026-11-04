import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPalette } from '../lib/palette.mjs';
import { renderThemeJson, fileBase } from '../lib/theme-json.mjs';

const p = loadPalette('scripts/test/fixtures/sample.json');
const t = renderThemeJson(p);

test('fileBase prefixes the palette id', () => {
  assert.equal(fileBase(p), 'nightbrew_sample');
});

test('theme header points to its editor scheme', () => {
  assert.equal(t.name, 'Nightbrew Sample');
  assert.equal(t.dark, true);
  assert.equal(t.author, 'urtaav');
  assert.equal(t.editorScheme, '/nightbrew_sample.xml');
  assert.equal(t.parentTheme, undefined);
});

test('accent is the keyword color and backgrounds use named colors', () => {
  assert.equal(t.colors.accentColor, p.syntax.keyword);
  assert.equal(t.colors.backgroundColor, p.ui.bg);
  assert.equal(t.colors.panelColor, p.ui.panel);
  assert.equal(t.ui['*'].background, 'backgroundColor');
});

test('covers the main UI components', () => {
  for (const k of ['ActionButton', 'Button', 'CheckBox', 'ComboBox', 'EditorTabs', 'List', 'Tree', 'Table',
    'MainToolbar', 'TitlePane', 'ToolWindow', 'StatusBar', 'SearchEverywhere', 'Popup', 'ToolTip',
    'Notification', 'ProgressBar', 'ScrollBar', 'Link', 'VersionControl', 'ValidationTooltip', 'Counter', 'Tag']) {
    assert.ok(t.ui[k], k);
  }
});

test('every ui value is a hex color or a declared named color', () => {
  const named = new Set(Object.keys(t.colors));
  JSON.stringify(t.ui, (key, v) => {
    if (typeof v === 'string') assert.ok(/^#[0-9A-F]{6,8}$/i.test(v) || named.has(v), `${key}=${v}`);
    return v;
  });
});
