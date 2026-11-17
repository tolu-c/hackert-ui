import type { AppColorTheme, ColorScheme } from "./types";

export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly alpha: number;
}

export interface VariantColors {
  readonly background: string;
  readonly foreground: string;
  readonly hoverBackground: string;
  readonly hoverForeground: string;
  readonly activeBackground: string;
}

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#0a0a0a";
const BLACK = { r: 0, g: 0, b: 0, alpha: 1 } as const;
const WHITE = { r: 1, g: 1, b: 1, alpha: 1 } as const;
const NEAR_BLACK_LUMINANCE = 0.05;
const NEAR_WHITE_LUMINANCE = 0.85;

// Parsers are tried in order; adding a format means adding one entry.
const PARSERS: readonly {
  readonly pattern: RegExp;
  readonly parse: (body: string) => Rgba | undefined;
}[] = [
  { pattern: /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, parse: parseHex },
  { pattern: /^rgba?\((.*)\)$/i, parse: parseRgb },
  { pattern: /^oklch\((.*)\)$/i, parse: parseOklch },
];

export function parseColor(input: string): Rgba | undefined {
  const value = input.trim();

  for (const { pattern, parse } of PARSERS) {
    const match = pattern.exec(value);
    if (match?.[1] !== undefined) {
      return parse(match[1]);
    }
  }

  return undefined;
}

const cache = new Map<string, VariantColors>();

export function deriveVariantColors(
  variant: keyof AppColorTheme,
  color: string,
  scheme: ColorScheme = "light",
): VariantColors {
  const key = `${scheme}:${color}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const rgb = parseColor(color);
  if (!rgb) {
    throw new Error(
      `@hackert-ui/core: cannot derive colours for variant "${variant}" from "${color}" — use hex, rgb() or oklch()`,
    );
  }
  if (rgb.alpha < 1) {
    throw new Error(
      `@hackert-ui/core: cannot derive colours for variant "${variant}" from "${color}" — the colour must be opaque`,
    );
  }

  // Hover and press move away from the page: darker on light pages, lighter on
  // dark ones, flipping when the colour is already at that end.
  const lighten =
    scheme === "dark"
      ? luminance(rgb) <= NEAR_WHITE_LUMINANCE
      : luminance(rgb) < NEAR_BLACK_LUMINANCE;
  const target = lighten ? WHITE : BLACK;
  const hover = mix(rgb, target, lighten ? 0.12 : 0.1);
  const active = mix(rgb, target, lighten ? 0.24 : 0.2);

  const colors: VariantColors = Object.freeze({
    background: color,
    foreground: readableTextOn(rgb),
    hoverBackground: toHex(hover),
    hoverForeground: readableTextOn(hover),
    activeBackground: toHex(active),
  });

  cache.set(key, colors);
  return colors;
}

function parseHex(digits: string): Rgba {
  const full = digits.length <= 4 ? digits.replace(/./g, "$&$&") : digits;
  const channel = (index: number) => Number.parseInt(full.slice(index, index + 2), 16) / 255;

  return { r: channel(0), g: channel(2), b: channel(4), alpha: full.length === 8 ? channel(6) : 1 };
}

function parseRgb(body: string): Rgba | undefined {
  const parts = splitArguments(body);
  if (parts.length !== 3 && parts.length !== 4) {
    return undefined;
  }

  const [r, g, b] = parts.slice(0, 3).map((part) => parseNumber(part, 255));
  const alpha = parts[3] === undefined ? 1 : parseNumber(parts[3], 1);

  return validRgba(r, g, b, alpha);
}

function parseOklch(body: string): Rgba | undefined {
  const parts = splitArguments(body);
  if (parts.length !== 3 && parts.length !== 4) {
    return undefined;
  }

  const [lightnessPart, chromaPart, huePart, alphaPart] = parts;
  const lightness = parseNumber(lightnessPart, 1);
  const chroma = parseNumber(chromaPart, 1, 0.4);
  const hue = parseNumber(huePart?.replace(/deg$/i, ""), 1);
  const alpha = alphaPart === undefined ? 1 : parseNumber(alphaPart, 1);

  if (![lightness, chroma, hue].every(Number.isFinite)) {
    return undefined;
  }

  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const bAxis = chroma * Math.sin(radians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * bAxis) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * bAxis) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * bAxis) ** 3;

  return validRgba(
    gammaEncode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gammaEncode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gammaEncode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    alpha,
  );
}

function splitArguments(body: string): string[] {
  return body.split(/[\s,/]+/).filter(Boolean);
}

// A percentage maps 100% to `percentScale`; a bare number is divided by `numberScale`.
function parseNumber(part: string | undefined, numberScale: number, percentScale = 1): number {
  if (part === undefined) {
    return Number.NaN;
  }
  if (part === "none") {
    return 0;
  }
  if (part.endsWith("%")) {
    return (Number(part.slice(0, -1)) / 100) * percentScale;
  }
  return Number(part) / numberScale;
}

function validRgba(
  r: number | undefined,
  g: number | undefined,
  b: number | undefined,
  alpha: number,
): Rgba | undefined {
  if (r === undefined || g === undefined || b === undefined) {
    return undefined;
  }
  if (![r, g, b, alpha].every(Number.isFinite)) {
    return undefined;
  }
  return { r: clamp(r), g: clamp(g), b: clamp(b), alpha: clamp(alpha) };
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function gammaEncode(linear: number): number {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
}

function gammaDecode(encoded: number): number {
  return encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4;
}

// WCAG 2 relative luminance.
function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * gammaDecode(r) + 0.7152 * gammaDecode(g) + 0.0722 * gammaDecode(b);
}

function contrast(first: Rgba, second: Rgba): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

function readableTextOn(background: Rgba): string {
  const light = parseHex(LIGHT_TEXT.slice(1));
  const dark = parseHex(DARK_TEXT.slice(1));
  return contrast(background, light) >= contrast(background, dark) ? LIGHT_TEXT : DARK_TEXT;
}

function mix(from: Rgba, to: Rgba, amount: number): Rgba {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
    alpha: 1,
  };
}

function toHex({ r, g, b }: Rgba): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
