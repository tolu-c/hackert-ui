import { describe, expect, it } from "vite-plus/test";

import { formatNumberText, getSeparators, parseNumberText, reformat } from "./number-format";

const usd = { locale: "en-US", currency: "USD" } as const;
const plain = { locale: "en-US", decimals: 2 } as const;

describe("getSeparators", () => {
  it("reads them from the locale", () => {
    expect(getSeparators("en-US")).toEqual({ group: ",", decimal: "." });
    expect(getSeparators("de-DE")).toEqual({ group: ".", decimal: "," });
  });
});

describe("formatNumberText", () => {
  it("groups thousands for currencies and pads to the currency's decimals", () => {
    expect(formatNumberText(1234567.5, usd)).toBe("1,234,567.50");
  });

  it("uses the locale's separators", () => {
    expect(formatNumberText(1234.5, { locale: "de-DE", currency: "EUR" })).toBe("1.234,50");
  });

  it("does not group unless asked", () => {
    expect(formatNumberText(1234.5, plain)).toBe("1234.5");
    expect(formatNumberText(1234.5, { ...plain, thousandSeparator: true })).toBe("1,234.5");
  });

  it("formats null as empty and keeps negatives", () => {
    expect(formatNumberText(null, plain)).toBe("");
    expect(formatNumberText(-1234.5, { ...plain, thousandSeparator: true })).toBe("-1,234.5");
  });

  it("respects a currency with no minor unit", () => {
    expect(formatNumberText(1500, { locale: "en-US", currency: "JPY" })).toBe("1,500");
  });
});

describe("parseNumberText", () => {
  it("reads formatted text back to a number", () => {
    expect(parseNumberText("1,234,567.5", usd)).toBe(1234567.5);
    expect(parseNumberText("1.234,5", { locale: "de-DE" })).toBe(1234.5);
    expect(parseNumberText("-12", plain)).toBe(-12);
  });

  it("returns null when there is no number yet", () => {
    for (const text of ["", "-", ".", "-."]) expect(parseNumberText(text, plain)).toBeNull();
  });
});

describe("reformat", () => {
  it("groups as digits are typed and keeps the caret after the typed digit", () => {
    expect(reformat("1234", 4, usd)).toEqual({ text: "1,234", caret: 5, value: 1234 });
    expect(reformat("1,2345", 6, usd)).toEqual({ text: "12,345", caret: 6, value: 12345 });
  });

  it("keeps the caret in place when typing in the middle", () => {
    expect(reformat("1,2934", 4, usd)).toEqual({ text: "12,934", caret: 4, value: 12934 });
  });

  it("keeps a partial decimal", () => {
    expect(reformat("12.", 3, usd)).toEqual({ text: "12.", caret: 3, value: 12 });
    expect(reformat("12.5", 4, usd)).toEqual({ text: "12.5", caret: 4, value: 12.5 });
  });

  it("starts a bare decimal with a zero", () => {
    expect(reformat(".", 1, usd)).toEqual({ text: "0.", caret: 2, value: 0 });
  });

  it("limits the decimal places", () => {
    expect(reformat("1.2345", 6, usd)).toEqual({ text: "1.23", caret: 4, value: 1.23 });
  });

  it("drops a second decimal separator and unknown characters", () => {
    expect(reformat("1.2.3a", 6, plain).text).toBe("1.23");
  });

  it("strips leading zeros", () => {
    expect(reformat("007", 3, plain)).toEqual({ text: "7", caret: 1, value: 7 });
    expect(reformat("00.5", 4, plain)).toEqual({ text: "0.5", caret: 3, value: 0.5 });
  });

  it("keeps a lone zero", () => {
    expect(reformat("0", 1, plain)).toEqual({ text: "0", caret: 1, value: 0 });
    expect(reformat("-0", 2, plain).text).toBe("-0");
  });

  it("allows a leading minus only when negatives are allowed", () => {
    expect(reformat("-5", 2, plain)).toEqual({ text: "-5", caret: 2, value: -5 });
    expect(reformat("-", 1, plain)).toEqual({ text: "-", caret: 1, value: null });
    expect(reformat("-5", 2, { ...plain, allowNegative: false }).text).toBe("5");
  });

  it("cleans pasted text", () => {
    expect(reformat("$1,234.567 USD", 14, usd)).toEqual({
      text: "1,234.56",
      caret: 8,
      value: 1234.56,
    });
  });

  it("rejects decimals entirely when there are none", () => {
    expect(reformat("1.5", 3, { ...plain, decimals: 0 }).text).toBe("15");
  });

  it("uses the locale's decimal separator", () => {
    expect(reformat("1234,5", 6, { locale: "de-DE", currency: "EUR" })).toEqual({
      text: "1.234,5",
      caret: 7,
      value: 1234.5,
    });
  });
});
