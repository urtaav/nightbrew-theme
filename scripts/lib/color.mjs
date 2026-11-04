const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hue(hex) {
  const [r, g, b] = channels(hex);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

export function hueDistance(a, b) {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
}

// Linear RGB blend; t=0 returns a, t=1 returns b.
export function mix(a, b, t) {
  const ca = channels(a);
  const cb = channels(b);
  const out = ca.map((c, i) => Math.round((c + (cb[i] - c) * t) * 255));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
