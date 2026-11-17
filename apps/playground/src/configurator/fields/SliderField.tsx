import { useId } from "react";
import type { SliderControl } from "../controls";
import { FieldLabel } from "./FieldLabel";
import type { FieldProps } from "./types";

export function SliderField({ control, value, onChange }: FieldProps<SliderControl>) {
  const id = useId();
  const index = Math.max(0, control.options.indexOf(String(value)));

  return (
    <div>
      <FieldLabel htmlFor={id} aside={<code className="text-xs text-fg-muted">{value}</code>}>
        {control.label}
      </FieldLabel>
      <input
        id={id}
        type="range"
        min={0}
        max={control.options.length - 1}
        step={1}
        value={index}
        aria-valuetext={String(value)}
        onChange={(event) => {
          const option = control.options[Number(event.currentTarget.value)];
          if (option !== undefined) {
            onChange(option);
          }
        }}
        className="w-full cursor-pointer accent-fg"
      />
      <div className="mt-1 flex justify-between text-[11px] text-fg-faint" aria-hidden="true">
        {control.options.map((option) => (
          <span key={option} className={option === value ? "font-medium text-fg" : undefined}>
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
