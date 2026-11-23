import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";
import { useId } from "react";

import { useFieldControl } from "../FormField/field-control";
import type { SelectOption } from "./filter-options";
import { useCombobox } from "./useCombobox";

export type { SelectOption } from "./filter-options";

type Excluded = "value" | "defaultValue" | "id" | "name" | "onChange" | "children";

interface SelectInputBase {
  readonly options: readonly SelectOption[];
}

export interface NativeSelectInputProps
  extends Omit<ComponentPropsWithoutRef<"select">, Excluded>, SelectInputBase {
  readonly mode?: "select";
  // Shown, disabled, while nothing is chosen.
  readonly placeholder?: string;
}

export interface ComboboxSelectInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, Excluded | "type" | "role">, SelectInputBase {
  // searchable: the value must be one of the options.
  // autocomplete: free text, with the options as suggestions.
  readonly mode: "searchable" | "autocomplete";
  readonly emptyMessage?: string;
}

export type SelectInputProps = NativeSelectInputProps | ComboboxSelectInputProps;

function isCombobox(props: SelectInputProps): props is ComboboxSelectInputProps {
  return props.mode === "searchable" || props.mode === "autocomplete";
}

export function SelectInput(props: SelectInputProps) {
  return isCombobox(props) ? <ComboboxInput {...props} /> : <NativeSelect {...props} />;
}

function NativeSelect({
  options,
  placeholder,
  mode: _mode,
  ...selectProps
}: NativeSelectInputProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value);

  return (
    <select
      {...selectProps}
      {...controlProps}
      value={value ?? ""}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={(event) => {
        controlProps.onBlur();
        selectProps.onBlur?.(event);
      }}
    >
      {placeholder === undefined ? null : (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ComboboxInput({
  options,
  mode,
  emptyMessage = "No results",
  ...inputProps
}: ComboboxSelectInputProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value) ?? "";
  const listId = useId();
  const combobox = useCombobox({
    options,
    mode,
    value,
    onValueChange: field.handleChange,
  });
  const state = combobox.open ? "open" : "closed";
  const listShown = combobox.open && combobox.visible.length > 0;
  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <div data-state={state}>
      <input
        {...inputProps}
        {...controlProps}
        type="text"
        role="combobox"
        autoComplete="off"
        value={combobox.text}
        aria-expanded={listShown}
        aria-controls={listShown ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          combobox.activeIndex >= 0 ? optionId(combobox.activeIndex) : undefined
        }
        data-state={state}
        onChange={combobox.onInputChange}
        onClick={(event) => {
          combobox.show();
          inputProps.onClick?.(event);
        }}
        onKeyDown={(event) => {
          combobox.onKeyDown(event);
          inputProps.onKeyDown?.(event);
        }}
        onBlur={(event) => {
          combobox.onBlur();
          controlProps.onBlur();
          inputProps.onBlur?.(event);
        }}
      />
      {listShown ? (
        <ul id={listId} role="listbox">
          {combobox.visible.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === combobox.activeIndex}
              aria-disabled={option.disabled || undefined}
              data-selected={option.value === value || option.label === value ? "" : undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                combobox.select(option);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
      {combobox.open && combobox.visible.length === 0 && mode === "searchable" ? (
        <div role="status">{emptyMessage}</div>
      ) : null}
    </div>
  );
}
