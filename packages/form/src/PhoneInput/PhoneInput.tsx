import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { autoUpdate, flip, offset, size, useFloating } from "@floating-ui/react-dom";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSelector } from "@tanstack/react-form";
import type { CountryCode } from "libphonenumber-js";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useFieldControl } from "../FormField/field-control";
import type { SelectOption, SelectPrimitive } from "../SelectInput/options";
import { useCombobox } from "../SelectInput/useCombobox";
import { InputBase } from "../styles/InputBase";
import { cx } from "../styles/theme-vars";
import {
  caretAfterDigits,
  deleteDigitAfter,
  deleteDigitBefore,
  describeCountry,
  digitsOf,
  formatPhone,
  fromValue,
  listCountries,
  nationalDigits,
} from "./phone-format";

export interface PhoneInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "inputMode" | "value" | "defaultValue" | "id" | "name" | "onChange"
> {
  // Used until a stored or typed number says otherwise. Defaults to "US".
  readonly defaultCountry?: CountryCode | undefined;
  // Limit the country list to these.
  readonly countries?: readonly CountryCode[] | undefined;
  // Locale for country names; defaults to the browser's.
  readonly locale?: string | undefined;
  readonly searchPlaceholder?: string | undefined;
  readonly searchLabel?: string | undefined;
  readonly nothingFoundMessage?: ReactNode;
  // Prefix for the country button's accessible name: "<label>: Nigeria +234".
  readonly countryLabel?: string | undefined;
}

const MIDDLEWARE = [
  offset(4),
  flip({ padding: 8 }),
  size({
    padding: 8,
    apply({ rects, availableHeight, elements }) {
      elements.floating.style.width = `${Math.max(rects.reference.width, 260)}px`;
      elements.floating.style.maxHeight = `${Math.max(160, Math.min(320, availableHeight))}px`;
    },
  }),
];

const CHEVRON = <HugeiconsIcon icon={ArrowDown01Icon} size={14} aria-hidden="true" />;

// A tel input bound to the surrounding TanStack field, with a searchable country
// picker. The field value is the number in E.164 ("+2348031234567"), or "".
export function PhoneInput({
  defaultCountry = "US",
  countries,
  locale,
  searchPlaceholder = "Search countries",
  searchLabel = "Search countries",
  nothingFoundMessage = "No countries found",
  countryLabel = "Country",
  className,
  ...inputProps
}: PhoneInputProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value) ?? "";
  const [state, setState] = useState(() => fromValue(value, defaultCountry));
  const [seenValue, setSeenValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const listId = useId();

  // The form changed the value (reset, setFieldValue): show it.
  if (value !== seenValue) {
    setSeenValue(value);
    setState(fromValue(value, state.country));
  }

  const countriesKey = countries?.join(",");
  // countriesKey stands in for the array, so a new array with the same codes is not a change.
  const list = useMemo(() => listCountries(locale, countries), [locale, countriesKey]);
  const options = useMemo<SelectOption<SelectPrimitive>[]>(
    () =>
      list.map((country) => ({
        value: country.code,
        label: `${country.name} +${country.dial}`,
        disabled: false,
      })),
    [list],
  );
  const byCode = useMemo(() => new Map(list.map((country) => [country.code, country])), [list]);
  const current = byCode.get(state.country) ?? describeCountry(state.country, locale);

  function apply(raw: string, country: CountryCode) {
    const next = formatPhone(raw, country);
    setState(next);
    setSeenValue(next.value);
    field.handleChange(next.value);
    return next;
  }

  function pick(code: CountryCode) {
    apply(nationalDigits(state), code);
    pendingCaret.current = Number.MAX_SAFE_INTEGER;
    inputRef.current?.focus();
  }

  // The search box is the combobox; the chosen country lives in `state`, so the
  // search starts empty each time the list opens.
  const combobox = useCombobox({
    options,
    mode: "searchable",
    value: null,
    onValueChange: (next) => {
      if (typeof next === "string") pick(next as CountryCode);
    },
  });
  const optionId = (index: number) => `${listId}-option-${index}`;

  const { refs, floatingStyles, placement } = useFloating({
    open: combobox.open,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: MIDDLEWARE,
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    if (pendingCaret.current === null) return;
    const caret = Math.min(pendingCaret.current, inputRef.current?.value.length ?? 0);
    inputRef.current?.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  });

  // Keep the active country in view as the arrows move it.
  useEffect(() => {
    if (!combobox.open || combobox.activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[id="${optionId(combobox.activeIndex)}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  });

  function openList() {
    combobox.show();
    const index = combobox.visible.findIndex((option) => option.value === state.country);
    if (index >= 0) combobox.highlight(index);
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="hui-section-button hui-country-trigger"
      aria-label={`${countryLabel}: ${current.name} +${current.dial}`}
      aria-haspopup="listbox"
      aria-expanded={combobox.open}
      disabled={inputProps.disabled}
      // Keep focus in the search box, so a second click closes rather than reopens.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => (combobox.open ? combobox.toggle() : openList())}
    >
      <span className="hui-country-flag" aria-hidden="true">
        {current.flag}
      </span>
      <span>+{current.dial}</span>
      {CHEVRON}
    </button>
  );

  return (
    <InputBase
      leftSection={trigger}
      leftSectionWidth={`calc(${current.dial.length + 1}ch + 56px)`}
      dataState={combobox.open ? "open" : "closed"}
    >
      <input
        {...inputProps}
        {...controlProps}
        ref={(node) => {
          inputRef.current = node;
          refs.setReference(node);
        }}
        type="tel"
        inputMode="tel"
        autoComplete={inputProps.autoComplete ?? "tel"}
        className={cx("hui-input", className)}
        value={state.text}
        onChange={(event) => {
          const input = event.target;
          const caret = input.selectionStart ?? input.value.length;
          const inputType = (event.nativeEvent as InputEvent).inputType;
          const formattingOnly =
            inputType?.startsWith("delete") && digitsOf(input.value) === digitsOf(state.text);
          const raw = !formattingOnly
            ? input.value
            : inputType === "deleteContentForward"
              ? deleteDigitAfter(input.value, caret)
              : deleteDigitBefore(input.value, caret);
          const digitsBeforeCaret = digitsOf(raw.slice(0, caret)).length;
          const next = apply(raw, state.country);
          pendingCaret.current = caretAfterDigits(next.text, digitsBeforeCaret);
        }}
        onBlur={(event) => {
          controlProps.onBlur();
          inputProps.onBlur?.(event);
        }}
      />
      {combobox.open ? (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="hui-dropdown hui-country-dropdown"
          data-side={placement.split("-")[0]}
        >
          <div className="hui-country-search">
            <input
              // The list opens from a button, so the search box takes focus at once.
              autoFocus
              type="text"
              role="combobox"
              autoComplete="off"
              className="hui-input"
              aria-label={searchLabel}
              placeholder={searchPlaceholder}
              aria-expanded={combobox.visible.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                combobox.activeIndex >= 0 ? optionId(combobox.activeIndex) : undefined
              }
              value={combobox.text}
              onChange={combobox.onInputChange}
              onKeyDown={(event) => {
                combobox.onKeyDown(event);
                if (event.key === "Escape") triggerRef.current?.focus();
              }}
              onBlur={combobox.onBlur}
            />
          </div>
          {combobox.visible.length > 0 ? (
            <div
              id={listId}
              role="listbox"
              aria-label={countryLabel}
              ref={listRef}
              className="hui-country-list"
            >
              {combobox.visible.map((option, index) => {
                const country = byCode.get(option.value as CountryCode);
                if (!country) return null;
                return (
                  <div
                    key={country.code}
                    id={optionId(index)}
                    role="option"
                    className="hui-option"
                    aria-selected={index === combobox.activeIndex}
                    data-active={index === combobox.activeIndex ? "" : undefined}
                    data-selected={country.code === state.country ? "" : undefined}
                    onMouseMove={() => combobox.highlight(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      combobox.select(option);
                    }}
                  >
                    <span className="hui-country-flag" aria-hidden="true">
                      {country.flag}
                    </span>
                    <span className="hui-country-name">{country.name}</span>
                    <span className="hui-country-dial">+{country.dial}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div role="status" className="hui-nothing-found">
              {nothingFoundMessage}
            </div>
          )}
        </div>
      ) : null}
    </InputBase>
  );
}
