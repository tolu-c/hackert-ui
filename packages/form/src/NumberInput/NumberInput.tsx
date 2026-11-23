import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";
import { useLayoutEffect, useReducer, useRef, useState } from "react";

import { useFieldControl } from "../FormField/field-control";
import { InputBase } from "../styles/InputBase";
import { cx } from "../styles/theme-vars";
import {
  formatNumberText,
  getCurrencyAffix,
  reformat,
  type NumberFormatOptions,
} from "./number-format";

export interface NumberInputProps
  extends
    Omit<
      ComponentPropsWithoutRef<"input">,
      "type" | "inputMode" | "value" | "defaultValue" | "id" | "name" | "onChange"
    >,
    NumberFormatOptions {}

export function NumberInput({
  locale,
  currency,
  decimals,
  thousandSeparator,
  allowNegative,
  className,
  ...inputProps
}: NumberInputProps) {
  const options: NumberFormatOptions = {
    locale,
    currency,
    decimals,
    thousandSeparator,
    allowNegative,
  };
  const { field, controlProps } = useFieldControl<number | null>();
  const value = useSelector(field.store, (state) => state.value) ?? null;
  const [text, setText] = useState(() => formatNumberText(value, options));
  const [seenValue, setSeenValue] = useState(value);
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);

  // The form changed the value (reset, setFieldValue): show it.
  if (value !== seenValue) {
    setSeenValue(value);
    setText(formatNumberText(value, options));
  }

  useLayoutEffect(() => {
    if (pendingCaret.current === null) return;
    inputRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  });

  const affix = currency ? getCurrencyAffix(options) : undefined;
  const symbol = affix ? <span aria-hidden="true">{affix.symbol}</span> : undefined;
  // Room for the symbol itself, so multi-letter ones like CHF or CA$ never run into the digits.
  const symbolWidth = affix ? `calc(${affix.symbol.length}ch + 20px)` : undefined;

  return (
    <InputBase
      leftSection={affix?.position === "left" ? symbol : undefined}
      rightSection={affix?.position === "right" ? symbol : undefined}
      leftSectionWidth={affix?.position === "left" ? symbolWidth : undefined}
      rightSectionWidth={affix?.position === "right" ? symbolWidth : undefined}
    >
      <input
        {...inputProps}
        {...controlProps}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={cx("hui-input", className)}
        value={text}
        onChange={(event) => {
          const next = reformat(event.target.value, event.target.selectionStart ?? 0, options);
          pendingCaret.current = next.caret;
          setText(next.text);
          setSeenValue(next.value);
          field.handleChange(next.value);
          rerender();
        }}
        onBlur={(event) => {
          controlProps.onBlur();
          setText(formatNumberText(value, options));
          inputProps.onBlur?.(event);
        }}
      />
    </InputBase>
  );
}
