import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { autoUpdate, flip, offset, size, useFloating } from "@floating-ui/react-dom";
import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useRef } from "react";

import { InputBase } from "../styles/InputBase";
import { cx } from "../styles/theme-vars";
import {
  normalizeOptions,
  type SelectData,
  type SelectOption,
  type SelectPrimitive,
} from "./options";
import { useCombobox } from "./useCombobox";

type InputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "role" | "children" | "readOnly"
>;

export interface SelectBaseProps<TValue extends SelectPrimitive = string> extends InputProps {
  readonly options: SelectData<TValue>;
  // Shown when nothing matches; without it the dropdown just hides.
  readonly nothingFoundMessage?: ReactNode;
  readonly withCheckIcon?: boolean | undefined;
  readonly checkIconPosition?: "left" | "right" | undefined;
  // Reserve the check's space on every option so labels line up.
  readonly withAlignedLabels?: boolean | undefined;
}

export type SelectProps<TValue extends SelectPrimitive = string> = SelectBaseProps<TValue> &
  (
    | {
        readonly mode?: "select" | "searchable" | undefined;
        readonly value: TValue | null;
        readonly onChange: (value: TValue | null) => void;
      }
    | {
        readonly mode: "autocomplete";
        readonly value: string;
        readonly onChange: (value: string) => void;
      }
  );

const MIDDLEWARE = [
  offset(4),
  flip({ padding: 8 }),
  size({
    padding: 8,
    apply({ rects, availableHeight, elements }) {
      elements.floating.style.width = `${rects.reference.width}px`;
      elements.floating.style.maxHeight = `${Math.max(120, Math.min(280, availableHeight))}px`;
    },
  }),
];

const CHEVRON = <HugeiconsIcon icon={UnfoldMoreIcon} size={16} aria-hidden="true" />;
const CHECK = <HugeiconsIcon icon={Tick02Icon} size={14} aria-hidden="true" />;

interface Segment {
  readonly group: string | undefined;
  readonly entries: { readonly option: SelectOption<SelectPrimitive>; readonly index: number }[];
}

// Consecutive options that share a group become one segment.
function segment(options: readonly SelectOption<SelectPrimitive>[]) {
  const segments: Segment[] = [];
  options.forEach((option, index) => {
    const last = segments.at(-1);
    if (last && last.group === option.group) last.entries.push({ option, index });
    else segments.push({ group: option.group, entries: [{ option, index }] });
  });
  return segments;
}

export function Select<TValue extends SelectPrimitive = string>(props: SelectProps<TValue>) {
  const {
    options,
    mode = "select",
    value,
    onChange,
    nothingFoundMessage,
    withCheckIcon = true,
    checkIconPosition = "left",
    withAlignedLabels = false,
    className,
    id,
    ...inputProps
  } = props;
  const fallbackId = useId();
  const listId = useId();
  const listRef = useRef<HTMLDivElement | null>(null);
  // One handler for both modes: autocomplete passes text, the others pass an option's value.
  const onValueChange = onChange as (next: SelectPrimitive | null) => void;

  const combobox = useCombobox({
    options: normalizeOptions(options),
    mode,
    value,
    onValueChange,
  });
  const listShown = combobox.open && combobox.visible.length > 0;
  const nothingShown =
    combobox.open && combobox.visible.length === 0 && nothingFoundMessage != null;
  const { refs, floatingStyles, placement } = useFloating({
    open: listShown || nothingShown,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: MIDDLEWARE,
    whileElementsMounted: autoUpdate,
  });
  const side = placement.split("-")[0];
  const optionId = (index: number) => `${listId}-option-${index}`;

  // Keep the active option in view as the arrows move it.
  useEffect(() => {
    if (!listShown || combobox.activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[id="${optionId(combobox.activeIndex)}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  });

  function renderOption({ option, index }: Segment["entries"][number]) {
    const chosen = combobox.isChosen(option);
    const showCheck = withCheckIcon && (chosen || withAlignedLabels);

    return (
      <div
        key={`${String(option.value)}-${index}`}
        id={optionId(index)}
        role="option"
        className="hui-option"
        aria-selected={index === combobox.activeIndex}
        aria-disabled={option.disabled || undefined}
        data-active={index === combobox.activeIndex ? "" : undefined}
        data-selected={chosen ? "" : undefined}
        data-check-position={withCheckIcon ? checkIconPosition : undefined}
        onMouseMove={() => combobox.highlight(index)}
        onMouseDown={(event) => {
          event.preventDefault();
          combobox.select(option);
        }}
      >
        {showCheck ? <span className="hui-option-check">{chosen ? CHECK : null}</span> : null}
        {option.label}
      </div>
    );
  }

  return (
    <InputBase
      rightSection={mode === "autocomplete" ? undefined : CHEVRON}
      dataState={combobox.open ? "open" : "closed"}
    >
      <input
        {...inputProps}
        id={id ?? fallbackId}
        ref={refs.setReference}
        type="text"
        role="combobox"
        autoComplete="off"
        readOnly={mode === "select"}
        className={cx("hui-input", className)}
        value={combobox.text}
        aria-haspopup="listbox"
        aria-expanded={listShown}
        aria-controls={listShown ? listId : undefined}
        aria-autocomplete={mode === "select" ? undefined : "list"}
        aria-activedescendant={
          listShown && combobox.activeIndex >= 0 ? optionId(combobox.activeIndex) : undefined
        }
        data-select-only={mode === "select" ? "" : undefined}
        data-state={combobox.open ? "open" : "closed"}
        onChange={combobox.onInputChange}
        onClick={(event) => {
          if (mode === "select") combobox.toggle();
          else combobox.show();
          inputProps.onClick?.(event);
        }}
        onKeyDown={(event) => {
          combobox.onKeyDown(event);
          inputProps.onKeyDown?.(event);
        }}
        onBlur={(event) => {
          combobox.onBlur();
          inputProps.onBlur?.(event);
        }}
      />
      {listShown ? (
        <div
          id={listId}
          role="listbox"
          ref={(node) => {
            listRef.current = node;
            refs.setFloating(node);
          }}
          style={floatingStyles}
          className="hui-dropdown"
          data-side={side}
        >
          {segment(combobox.visible).map((part, partIndex) =>
            part.group === undefined ? (
              part.entries.map(renderOption)
            ) : (
              <div
                key={`group-${part.group}-${partIndex}`}
                role="group"
                aria-labelledby={`${listId}-group-${partIndex}`}
              >
                <div id={`${listId}-group-${partIndex}`} className="hui-option-group-label">
                  {part.group}
                </div>
                {part.entries.map(renderOption)}
              </div>
            ),
          )}
        </div>
      ) : null}
      {nothingShown ? (
        <div
          role="status"
          ref={refs.setFloating}
          style={floatingStyles}
          className="hui-dropdown hui-nothing-found"
          data-side={side}
        >
          {nothingFoundMessage}
        </div>
      ) : null}
    </InputBase>
  );
}
