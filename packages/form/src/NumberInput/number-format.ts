export interface NumberFormatOptions {
  readonly locale?: string | undefined;
  readonly currency?: string | undefined;
  readonly decimals?: number | undefined;
  readonly thousandSeparator?: boolean | undefined;
  readonly allowNegative?: boolean | undefined;
}

interface Resolved {
  readonly group: string;
  readonly decimal: string;
  readonly decimals: number;
  readonly grouping: boolean;
  readonly allowNegative: boolean;
  readonly padDecimals: number;
  readonly symbol: string | undefined;
  readonly symbolPosition: "left" | "right";
}

const DEFAULT_LOCALE = "en-US";
const MAX_DECIMALS = 20;
const resolvedCache = new Map<string, Resolved>();

export function getSeparators(locale: string = DEFAULT_LOCALE) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === "group")?.value ?? "",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  };
}

// Built once per distinct set of options, not on every keystroke.
function resolve(options: NumberFormatOptions): Resolved {
  const { locale = DEFAULT_LOCALE, currency, decimals, thousandSeparator, allowNegative } = options;
  const key = [locale, currency, decimals, thousandSeparator, allowNegative].join("|");
  const cached = resolvedCache.get(key);
  if (cached) return cached;

  const { group, decimal } = getSeparators(locale);
  const currencyFormat = currency
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
    : undefined;
  const currencyDecimals = currencyFormat?.resolvedOptions().maximumFractionDigits;
  const currencyParts = currencyFormat?.formatToParts(1);
  const resolved: Resolved = {
    group,
    decimal,
    decimals: decimals ?? currencyDecimals ?? MAX_DECIMALS,
    grouping: thousandSeparator ?? currency !== undefined,
    allowNegative: allowNegative ?? true,
    padDecimals: currency ? (currencyDecimals ?? 0) : 0,
    symbol: currencyParts?.find((part) => part.type === "currency")?.value,
    symbolPosition: symbolAfterNumber(currencyParts) ? "right" : "left",
  };
  resolvedCache.set(key, resolved);
  return resolved;
}

function symbolAfterNumber(parts: readonly Intl.NumberFormatPart[] | undefined) {
  if (!parts) return false;
  const types = parts.map((part) => part.type);
  return types.indexOf("currency") > types.indexOf("integer");
}

export interface CurrencyAffix {
  readonly symbol: string;
  readonly position: "left" | "right";
}

export function getCurrencyAffix(options: NumberFormatOptions): CurrencyAffix | undefined {
  const { symbol, symbolPosition } = resolve(options);
  return symbol === undefined ? undefined : { symbol, position: symbolPosition };
}

function groupDigits(digits: string, resolved: Resolved) {
  return resolved.grouping ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, resolved.group) : digits;
}

export function formatNumberText(value: number | null, options: NumberFormatOptions) {
  if (value === null || Number.isNaN(value)) return "";
  const resolved = resolve(options);
  const fixed = Math.abs(value).toFixed(resolved.decimals);
  const [integer = "0", fraction = ""] = fixed.split(".");
  const trimmed = fraction.replace(/0+$/, "").padEnd(resolved.padDecimals, "0");
  const sign = value < 0 && resolved.allowNegative ? "-" : "";

  return sign + groupDigits(integer, resolved) + (trimmed ? resolved.decimal + trimmed : "");
}

export function parseNumberText(text: string, options: NumberFormatOptions): number | null {
  const { group, decimal } = resolve(options);
  const normalized = text
    .split(group)
    .join("")
    .replace(decimal, ".")
    .replace(/[^\d.-]/g, "");
  const negative = normalized.startsWith("-");
  const unsigned = normalized.replace(/-/g, "");
  if (!/\d/.test(unsigned)) return null;

  const value = Number(unsigned);
  return Number.isNaN(value) ? null : negative ? -value : value;
}

interface Kept {
  readonly char: string;
  readonly source: number;
}

// Rebuilds `text` as clean formatted text and moves the caret to the same
// digit, whatever grouping separators were added or removed before it.
export function reformat(text: string, caret: number, options: NumberFormatOptions) {
  const resolved = resolve(options);
  const negative = resolved.allowNegative && text.trimStart().startsWith("-");
  const integer: Kept[] = [];
  const fraction: Kept[] = [];
  let decimalSource: number | null = null;

  for (let index = 0; index < text.length; index++) {
    const char = text.charAt(index);
    if (char >= "0" && char <= "9") {
      if (decimalSource === null) integer.push({ char, source: index });
      else if (fraction.length < resolved.decimals) fraction.push({ char, source: index });
    } else if (char === resolved.decimal && decimalSource === null && resolved.decimals > 0) {
      decimalSource = index;
    }
  }

  while (integer.length > 1 && integer[0]?.char === "0") {
    integer.shift();
  }
  if (integer.length === 0 && decimalSource !== null) {
    integer.push({ char: "0", source: decimalSource - 0.5 });
  }

  const target =
    [...integer, ...fraction].filter((kept) => kept.source < caret).length +
    (decimalSource !== null && decimalSource < caret ? 1 : 0);
  const digits = integer.map((kept) => kept.char).join("");
  const sign = negative ? "-" : "";
  const formatted =
    sign +
    groupDigits(digits, resolved) +
    (decimalSource !== null ? resolved.decimal + fraction.map((kept) => kept.char).join("") : "");

  return {
    text: formatted,
    caret: caretAfterUnits(formatted, target, sign.length, resolved),
    value: parseNumberText(formatted, options),
  };
}

function caretAfterUnits(formatted: string, units: number, start: number, resolved: Resolved) {
  let seen = 0;
  for (let index = start; index < formatted.length; index++) {
    if (seen === units) return index;
    const char = formatted.charAt(index);
    if (char === resolved.decimal || (char >= "0" && char <= "9")) seen++;
  }
  return formatted.length;
}
