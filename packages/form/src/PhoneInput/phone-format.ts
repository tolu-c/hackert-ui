import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

export interface PhoneCountry {
  readonly code: CountryCode;
  readonly name: string;
  // The calling code without "+", e.g. "234".
  readonly dial: string;
  readonly flag: string;
}

export interface PhoneState {
  // What the input shows.
  readonly text: string;
  // The field value: E.164 ("+2348031234567"), or "" when there is no number.
  readonly value: string;
  readonly country: CountryCode;
}

const REGIONAL_INDICATOR_A = 0x1f1e6;

// "NG" → 🇳🇬, from the two regional indicator symbols for N and G.
export function flagOf(code: CountryCode): string {
  return String.fromCodePoint(
    REGIONAL_INDICATOR_A + code.charCodeAt(0) - 65,
    REGIONAL_INDICATOR_A + code.charCodeAt(1) - 65,
  );
}

function regionNames(locale: string | undefined) {
  return new Intl.DisplayNames(locale === undefined ? undefined : [locale], { type: "region" });
}

export function describeCountry(code: CountryCode, locale?: string): PhoneCountry {
  return {
    code,
    name: regionNames(locale).of(code) ?? code,
    dial: getCountryCallingCode(code),
    flag: flagOf(code),
  };
}

// Every supported country, or just `only`, sorted by name in the given locale.
export function listCountries(locale?: string, only?: readonly CountryCode[]): PhoneCountry[] {
  const names = regionNames(locale);
  return (only ?? getCountries())
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      dial: getCountryCallingCode(code),
      flag: flagOf(code),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, locale));
}

// Formats typed text for a country. A number typed with "+" picks its own country.
export function formatPhone(raw: string, country: CountryCode): PhoneState {
  const formatter = new AsYouType(country);
  const text = formatter.input(raw);
  return {
    text,
    value: formatter.getNumber()?.number ?? "",
    country: formatter.getCountry() ?? country,
  };
}

// The input state for a stored E.164 value.
export function fromValue(value: string, fallback: CountryCode): PhoneState {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined;
  if (!parsed) return { text: "", value: "", country: fallback };
  return { text: parsed.formatNational(), value, country: parsed.country ?? fallback };
}

// The national digits to carry over when the country changes.
export function nationalDigits(state: Pick<PhoneState, "text" | "value">): string {
  const parsed = state.value ? parsePhoneNumberFromString(state.value) : undefined;
  return parsed ? parsed.nationalNumber : state.text.replace(/\D/g, "");
}

// Digits and a leading "+": the characters formatting never adds or removes.
export function digitsOf(text: string): string {
  return text.replace(/[^\d+]/g, "");
}

// Backspace over a formatting character such as ")" would leave the digits as
// they were, and reformatting would put the character straight back. Remove the
// digit before the caret instead.
export function deleteDigitBefore(text: string, caret: number): string {
  const before = text.slice(0, caret).replace(/\d(?=\D*$)/, "");
  return before + text.slice(caret);
}

// Forward Delete over a formatting character: remove the first digit after the caret.
export function deleteDigitAfter(text: string, caret: number): string {
  return text.slice(0, caret) + text.slice(caret).replace(/\d/, "");
}

// The caret position just after the `count`th digit (or "+") of `text`.
export function caretAfterDigits(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) {
    if (/[\d+]/.test(text[index] ?? "")) seen++;
    if (seen === count) return index + 1;
  }
  return text.length;
}
