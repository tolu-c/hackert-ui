import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";

import { filterOptions, type SelectOption, type SelectPrimitive } from "./options";

// select: read-only trigger. searchable: the value must be an option.
// autocomplete: the value is the text, the options are suggestions.
export type ComboboxMode = "select" | "searchable" | "autocomplete";

export interface UseComboboxOptions {
  readonly options: readonly SelectOption<SelectPrimitive>[];
  readonly mode: ComboboxMode;
  readonly value: SelectPrimitive | null;
  readonly onValueChange: (value: SelectPrimitive | null) => void;
}

function firstEnabled(options: readonly SelectOption<SelectPrimitive>[]) {
  return options.findIndex((option) => !option.disabled);
}

function lastEnabled(options: readonly SelectOption<SelectPrimitive>[]) {
  for (let index = options.length - 1; index >= 0; index--) {
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

function step(options: readonly SelectOption<SelectPrimitive>[], from: number, direction: 1 | -1) {
  for (let index = from + direction; index >= 0 && index < options.length; index += direction) {
    if (!options[index]?.disabled) return index;
  }
  return from;
}

// The next enabled option after `from` whose label starts with `key`, wrapping around.
function typeahead(options: readonly SelectOption<SelectPrimitive>[], from: number, key: string) {
  const needle = key.toLowerCase();
  for (let offset = 1; offset <= options.length; offset++) {
    const index = (from + offset + options.length) % options.length;
    const option = options[index];
    if (option && !option.disabled && option.label.toLowerCase().startsWith(needle)) return index;
  }
  return -1;
}

function isPrintable(event: KeyboardEvent) {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function useCombobox({ options, mode, value, onValueChange }: UseComboboxOptions) {
  const isChosen = (option: SelectOption<SelectPrimitive>) =>
    mode === "autocomplete" ? option.label === value : option.value === value;
  const labelFor = (current: SelectPrimitive | null) =>
    mode === "autocomplete"
      ? String(current ?? "")
      : (options.find((option) => option.value === current)?.label ?? "");

  const [text, setText] = useState(() => labelFor(value));
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [seenValue, setSeenValue] = useState(value);

  // The value changed from outside (form reset, setFieldValue, a controlled parent): show it.
  if (value !== seenValue) {
    setSeenValue(value);
    setText(labelFor(value));
  }

  // Until the user types, show every option so a chosen value can be changed.
  const visible = mode !== "select" && typed ? filterOptions(options, text) : options;

  function commit(next: SelectPrimitive | null) {
    onValueChange(next);
    setSeenValue(next);
  }

  function show() {
    if (open) return;
    const chosen = visible.findIndex((option) => isChosen(option) && !option.disabled);
    setActiveIndex(mode === "autocomplete" || chosen >= 0 ? chosen : firstEnabled(visible));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setTyped(false);
    setActiveIndex(-1);
  }

  function toggle() {
    if (open) close();
    else show();
  }

  function select(option: SelectOption<SelectPrimitive>) {
    if (option.disabled) return;
    commit(mode === "autocomplete" ? option.label : option.value);
    setText(option.label);
    close();
  }

  function highlight(index: number) {
    if (index !== activeIndex && !visible[index]?.disabled) setActiveIndex(index);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (mode === "select") return;
    const next = event.target.value;
    setText(next);
    setTyped(true);
    setOpen(true);
    setActiveIndex(mode === "searchable" ? firstEnabled(filterOptions(options, next)) : -1);
    if (mode === "autocomplete") commit(next);
    else if (next === "") commit(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!open) return show();
        setActiveIndex(step(visible, activeIndex, event.key === "ArrowDown" ? 1 : -1));
        return;
      case "Home":
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? firstEnabled(visible) : lastEnabled(visible));
        return;
      case "Enter": {
        const active = visible[activeIndex];
        if (open && active) {
          event.preventDefault();
          select(active);
        } else if (!open && mode === "select") {
          event.preventDefault();
          show();
        }
        return;
      }
      case "Escape":
        event.preventDefault();
        if (open) return close();
        if (mode === "select") return;
        setText("");
        commit(mode === "autocomplete" ? "" : null);
        return;
      case "Tab":
        close();
        return;
    }

    if (mode !== "select" || !isPrintable(event)) return;
    event.preventDefault();
    if (event.key === " ") {
      const active = visible[activeIndex];
      if (open && active) select(active);
      else show();
      return;
    }
    const from = activeIndex >= 0 ? activeIndex : visible.findIndex(isChosen);
    const match = typeahead(visible, from, event.key);
    if (match < 0) return;
    setOpen(true);
    setActiveIndex(match);
  }

  function onBlur() {
    close();
    // Text that is not an option goes back to the chosen option's label.
    if (mode !== "autocomplete") setText(labelFor(value));
  }

  return {
    text,
    open,
    activeIndex,
    visible,
    isChosen,
    show,
    toggle,
    select,
    highlight,
    onInputChange,
    onKeyDown,
    onBlur,
  };
}
