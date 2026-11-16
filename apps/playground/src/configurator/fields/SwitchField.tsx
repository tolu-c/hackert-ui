import { useId } from "react";
import type { SwitchControl } from "../controls";
import type { FieldProps } from "./types";

export function SwitchField({ control, value, onChange }: FieldProps<SwitchControl>) {
  const id = useId();
  const checked = value === true;

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-slate-900">
        {control.label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="group relative h-5 w-9 cursor-pointer rounded-full bg-slate-300 transition-colors duration-150 aria-checked:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out group-aria-checked:translate-x-4 motion-reduce:transition-none" />
      </button>
    </div>
  );
}
