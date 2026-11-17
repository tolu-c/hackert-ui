import type { ComponentType, ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import type { Control, ControlValue, ControlValues } from "./controls";
import { SelectField } from "./fields/SelectField";
import { SliderField } from "./fields/SliderField";
import { SwatchesField } from "./fields/SwatchesField";
import { SwitchField } from "./fields/SwitchField";
import { TextField } from "./fields/TextField";
import type { FieldProps } from "./fields/types";

// One renderer per control kind; a new kind is one entry here.
const FIELD_RENDERERS: {
  readonly [K in Control["kind"]]: ComponentType<FieldProps<Extract<Control, { kind: K }>>>;
} = {
  swatches: SwatchesField,
  slider: SliderField,
  select: SelectField,
  switch: SwitchField,
  text: TextField,
};

interface ConfiguratorProps<C extends readonly Control[]> {
  readonly controls: C;
  readonly values: ControlValues<C>;
  readonly onChange: (patch: Partial<ControlValues<C>>) => void;
  readonly code: string;
  readonly children: ReactNode;
}

export function Configurator<const C extends readonly Control[]>({
  controls,
  values,
  onChange,
  code,
  children,
}: ConfiguratorProps<C>) {
  const current: Readonly<Record<string, ControlValue>> = values;

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-h-64 items-center justify-center p-8">{children}</div>
        <div className="space-y-5 border-t border-line p-5 lg:border-t-0 lg:border-l">
          {controls.map((control) => {
            const Field = FIELD_RENDERERS[control.kind] as ComponentType<FieldProps<Control>>;
            const value = current[control.prop] ?? control.defaultValue;

            return (
              <Field
                key={control.prop}
                control={control}
                value={value}
                onChange={(next) => onChange({ [control.prop]: next } as Partial<ControlValues<C>>)}
              />
            );
          })}
        </div>
      </div>
      <div className="border-t border-line">
        <CodeBlock code={code} />
      </div>
    </div>
  );
}
