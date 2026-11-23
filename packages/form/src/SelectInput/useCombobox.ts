import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";

import { filterOptions, type SelectOption } from "./filter-options";

export interface UseComboboxOptions {
  readonly options: readonly SelectOption[];
  // searchable: the value must be an option. autocomplete: the value is the text.
  readonly mode: "searchable" | "autocomplete";
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

function firstEnabled(options: readonly SelectOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function lastEnabled(options: readonly SelectOption[]) {
  for (let index = options.length - 1; index >= 0; index--) {
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

function step(options: readonly SelectOption[], from: number, direction: 1 | -1) {
  for (let index = from + direction; index >= 0 && index < options.length; index += direction) {
    if (!options[index]?.disabled) return index;
  }
  return from;
}

export function useCombobox({ options, mode, value, onValueChange }: UseComboboxOptions) {
  const textFor = (current: string) =>
    mode === "searchable"
      ? (options.find((option) => option.value === current)?.label ?? "")
      : current;

  const [text, setText] = useState(() => textFor(value));
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [seenValue, setSeenValue] = useState(value);

  // The form changed the value (reset, setFieldValue): show it.
  if (value !== seenValue) {
    setSeenValue(value);
    setText(textFor(value));
  }

  // Until the user types, show every option so a chosen value can be changed.
  const visible = typed ? filterOptions(options, text) : options;

  function show() {
    if (open) return;
    // autocomplete stores the label, so match on whichever field the value holds.
    const selected = visible.findIndex(
      (option) =>
        (mode === "searchable" ? option.value : option.label) === value && !option.disabled,
    );
    setActiveIndex(
      mode === "searchable" ? (selected >= 0 ? selected : firstEnabled(visible)) : selected,
    );
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setTyped(false);
    setActiveIndex(-1);
  }

  function select(option: SelectOption) {
    if (option.disabled) return;
    const next = mode === "searchable" ? option.value : option.label;
    onValueChange(next);
    setSeenValue(next);
    setText(option.label);
    close();
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    const matches = filterOptions(options, next);
    setText(next);
    setTyped(true);
    setOpen(true);
    setActiveIndex(mode === "searchable" ? firstEnabled(matches) : -1);
    if (mode === "autocomplete" || next === "") {
      onValueChange(next);
      setSeenValue(next);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) return show();
        setActiveIndex(step(visible, activeIndex, event.key === "ArrowDown" ? 1 : -1));
        return;
      }
      case "Home":
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? firstEnabled(visible) : lastEnabled(visible));
        return;
      case "Enter": {
        const active = visible[activeIndex];
        if (!open || !active) return;
        event.preventDefault();
        select(active);
        return;
      }
      case "Escape":
        event.preventDefault();
        if (open) return close();
        setText("");
        onValueChange("");
        setSeenValue("");
        return;
      case "Tab":
        close();
        return;
    }
  }

  function onBlur() {
    close();
    // searchable: text that is not an option goes back to the chosen option.
    if (mode === "searchable") setText(textFor(value));
  }

  return { text, open, activeIndex, visible, show, select, onInputChange, onKeyDown, onBlur };
}
