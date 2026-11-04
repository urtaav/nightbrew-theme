import { hueDistance, mix } from './color.mjs';

const BOLD = 1;
const ITALIC = 2;
const WAVE_UNDERSCORE = 2;

const bare = (hex) => hex.slice(1).toUpperCase();

function option(name, { fg, bg, font, effect, effectType } = {}) {
  const lines = [];
  if (fg) lines.push(`        <option name="FOREGROUND" value="${bare(fg)}"/>`);
  if (bg) lines.push(`        <option name="BACKGROUND" value="${bare(bg)}"/>`);
  if (font) lines.push(`        <option name="FONT_TYPE" value="${font}"/>`);
  if (effect) lines.push(`        <option name="EFFECT_COLOR" value="${bare(effect)}"/>`);
  if (effectType !== undefined) lines.push(`        <option name="EFFECT_TYPE" value="${effectType}"/>`);
  return `    <option name="${name}">\n      <value>\n${lines.join('\n')}\n      </value>\n    </option>`;
}

// Role -> attribute keys. DEFAULT_* keys cascade to most languages; the rest
// cover languages that don't inherit from the defaults.
function syntaxMap(p) {
  const s = p.syntax;
  const headers = Array.from({ length: 6 }, (_, i) => `MARKDOWN_HEADER_LEVEL_${i + 1}`);
  return [
    [{ fg: s.keyword }, ['DEFAULT_KEYWORD', 'DEFAULT_LABEL', 'DEFAULT_DOC_COMMENT_TAG', 'XML_TAG_NAME', 'HTML_TAG_NAME']],
    [{ fg: s.keyword, font: BOLD }, headers],
    [{ fg: s.function }, ['DEFAULT_FUNCTION_DECLARATION', 'DEFAULT_FUNCTION_CALL', 'DEFAULT_STATIC_METHOD', 'JSON.PROPERTY_KEY', 'YAML_SCALAR_KEY']],
    [{ fg: s.string }, ['DEFAULT_STRING', 'MARKDOWN_CODE_SPAN']],
    [{ fg: s.number }, ['DEFAULT_NUMBER', 'DEFAULT_CONSTANT', 'DEFAULT_VALID_STRING_ESCAPE', 'DEFAULT_METADATA', 'DEFAULT_ENTITY', 'HTML_ATTRIBUTE_NAME', 'XML_ATTRIBUTE_NAME']],
    [{ fg: s.type }, ['DEFAULT_CLASS_NAME', 'DEFAULT_CLASS_REFERENCE', 'DEFAULT_INTERFACE_NAME', 'DEFAULT_DOC_COMMENT_TAG_VALUE']],
    [{ fg: s.parameter }, ['DEFAULT_PARAMETER', 'DEFAULT_REASSIGNED_PARAMETER']],
    [{ fg: s.comment, font: ITALIC }, ['DEFAULT_LINE_COMMENT', 'DEFAULT_BLOCK_COMMENT', 'DEFAULT_DOC_COMMENT']],
    [{ fg: p.ui.fg }, ['DEFAULT_IDENTIFIER', 'DEFAULT_INSTANCE_FIELD', 'DEFAULT_GLOBAL_VARIABLE', 'DEFAULT_TEMPLATE_LANGUAGE_COLOR']],
    [{ fg: p.ui.fg, font: ITALIC }, ['DEFAULT_STATIC_FIELD']],
    [{ fg: p.status.error }, ['DEFAULT_INVALID_STRING_ESCAPE', 'WRONG_REFERENCES_ATTRIBUTES']],
  ];
}

function ansi(p) {
  // Blue slot takes whichever syntax color actually reads as blue.
  const isBlue = (hex) => hueDistance(hex, '#0080FF') <= 40;
  const blue = isBlue(p.syntax.function) ? p.syntax.function : p.syntax.type;
  const cyan = mix(blue, p.syntax.string, 0.5);
  const map = {
    BLACK: p.ui.panel,
    RED: p.status.error,
    GREEN: p.syntax.string,
    YELLOW: p.status.warning,
    BLUE: blue,
    MAGENTA: p.syntax.keyword,
    CYAN: cyan,
    GRAY: p.ui.fgMuted,
    DARKGRAY: p.syntax.comment,
    WHITE: p.ui.fg,
  };
  // Bright variants reuse the base color to keep the palette tight.
  for (const c of ['RED', 'GREEN', 'YELLOW', 'BLUE', 'MAGENTA', 'CYAN']) map[`${c}_BRIGHT`] = map[c];
  return Object.entries(map).map(([k, v]) => [`CONSOLE_${k}_OUTPUT`, { fg: v }]);
}

export function renderSchemeXml(p) {
  const { ui, syntax, status } = p;
  const tint = (c, t = 0.25) => mix(ui.bg, c, t);

  const colors = {
    CARET_COLOR: ui.fg,
    CARET_ROW_COLOR: ui.line,
    GUTTER_BACKGROUND: ui.bg,
    LINE_NUMBERS_COLOR: syntax.comment,
    LINE_NUMBER_ON_CARET_ROW_COLOR: ui.fg,
    INDENT_GUIDE: ui.border,
    SELECTED_INDENT_GUIDE: ui.fgMuted,
    SELECTION_BACKGROUND: ui.selection,
    RIGHT_MARGIN_COLOR: ui.border,
    WHITESPACES: ui.border,
    METHOD_SEPARATORS_COLOR: ui.border,
    TEARLINE_COLOR: ui.border,
    ADDED_LINES_COLOR: status.added,
    MODIFIED_LINES_COLOR: status.modified,
    DELETED_LINES_COLOR: status.deleted,
    WHITESPACES_MODIFIED_LINES_COLOR: status.modified,
    CONSOLE_BACKGROUND_KEY: ui.bg,
    DOCUMENTATION_COLOR: ui.panel,
    INFORMATION_HINT: ui.line,
    ERROR_HINT: tint(status.error, 0.35),
    NOTIFICATION_BACKGROUND: ui.line,
  };

  const attrs = [
    ['TEXT', { fg: ui.fg, bg: ui.bg }],
    ...syntaxMap(p).flatMap(([style, keys]) => keys.map((k) => [k, style])),
    ['ERRORS_ATTRIBUTES', { effect: status.error, effectType: WAVE_UNDERSCORE }],
    ['WARNING_ATTRIBUTES', { effect: status.warning, effectType: WAVE_UNDERSCORE }],
    ['SEARCH_RESULT_ATTRIBUTES', { bg: tint(syntax.function) }],
    ['TEXT_SEARCH_RESULT_ATTRIBUTES', { bg: tint(syntax.function) }],
    ['WRITE_SEARCH_RESULT_ATTRIBUTES', { bg: tint(syntax.keyword) }],
    ['IDENTIFIER_UNDER_CARET_ATTRIBUTES', { bg: tint(syntax.function, 0.18) }],
    ['WRITE_IDENTIFIER_UNDER_CARET_ATTRIBUTES', { bg: tint(syntax.keyword, 0.18) }],
    ['MATCHED_BRACE_ATTRIBUTES', { fg: syntax.function, font: BOLD }],
    ['UNMATCHED_BRACE_ATTRIBUTES', { fg: status.error, font: BOLD }],
    ['DIFF_INSERTED', { bg: tint(status.added, 0.18) }],
    ['DIFF_MODIFIED', { bg: tint(status.modified, 0.18) }],
    ['DIFF_DELETED', { bg: tint(status.deleted, 0.18) }],
    ['CONSOLE_NORMAL_OUTPUT', { fg: ui.fg }],
    ['CONSOLE_ERROR_OUTPUT', { fg: status.error }],
    ['CONSOLE_SYSTEM_OUTPUT', { fg: ui.fgMuted }],
    ...ansi(p),
  ];

  const colorLines = Object.entries(colors).map(([k, v]) => `    <option name="${k}" value="${bare(v)}"/>`);

  return [
    `<scheme name="${p.name}" parent_scheme="Darcula" version="142">`,
    '  <colors>',
    ...colorLines,
    '  </colors>',
    '  <attributes>',
    ...attrs.map(([k, v]) => option(k, v)),
    '  </attributes>',
    '</scheme>',
    '',
  ].join('\n');
}
