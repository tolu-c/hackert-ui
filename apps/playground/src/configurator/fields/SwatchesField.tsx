import { type AppColorTheme, useVariantColors } from "@hackert-ui/core";
import { useId } from "react";
import type { SwatchesControl } from "../controls";
import type { FieldProps } from "./types";

export function SwatchesField({ control, value, onChange }: FieldProps<SwatchesControl>) {
  const name = useId();

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-900">{control.label}</legend>
      <div className="flex flex-wrap gap-2">
        {control.options.map((option) => (
          <Swatch
            key={option}
            name={name}
            option={option}
            checked={option === value}
            onSelect={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface SwatchProps {
  readonly name: string;
  readonly option: keyof AppColorTheme;
  readonly checked: boolean;
  readonly onSelect: (option: keyof AppColorTheme) => void;
}

function Swatch({ name, option, checked, onSelect }: SwatchProps) {
  const colors = useVariantColors(option);

  return (
    <label
      title={option}
      className="grid size-8 cursor-pointer place-items-center rounded-md transition-transform duration-150 ease-out active:scale-95 has-focus-visible:ring-2 has-focus-visible:ring-slate-900 has-focus-visible:ring-offset-2 motion-reduce:transition-none"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      <input
        type="radio"
        name={name}
        value={option}
        checked={checked}
        onChange={() => onSelect(option)}
        className="sr-only"
      />
      <span className="sr-only">{option}</span>
      {checked ? <CheckIcon /> : null}
    </label>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
