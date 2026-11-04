// Renders every palette in palettes/ into src/main/resources.
// Usage: node scripts/generate.mjs
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPalette, validatePalette } from './lib/palette.mjs';
import { renderThemeJson, fileBase } from './lib/theme-json.mjs';
import { renderSchemeXml } from './lib/scheme-xml.mjs';

export function generateAll(paletteDir, outDir) {
  const palettes = readdirSync(paletteDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, palette: loadPalette(join(paletteDir, f)) }));

  // Validate everything first so a bad palette never leaves half-written output.
  const problems = palettes.flatMap(({ file, palette }) => validatePalette(palette).map((m) => `${file}: ${m}`));
  if (problems.length) throw new Error(`Invalid palette(s):\n${problems.join('\n')}`);

  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const { palette } of palettes) {
    const base = join(outDir, fileBase(palette));
    writeFileSync(`${base}.theme.json`, `${JSON.stringify(renderThemeJson(palette), null, 2)}\n`);
    writeFileSync(`${base}.xml`, renderSchemeXml(palette));
    written.push(`${base}.theme.json`, `${base}.xml`);
  }
  return written;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const f of generateAll('palettes', 'src/main/resources')) console.log(`wrote ${f}`);
}
