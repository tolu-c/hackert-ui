import type { AppColorTheme } from "@hackert-ui/core";

interface ControlBase<P extends string> {
  readonly prop: P;
  readonly label: string;
}

export interface SwatchesControl<
  P extends string = string,
  O extends keyof AppColorTheme = keyof AppColorTheme,
> extends ControlBase<P> {
  readonly kind: "swatches";
  readonly options: readonly O[];
  readonly defaultValue: O;
}

export interface SliderControl<
  P extends string = string,
  O extends string = string,
> extends ControlBase<P> {
  readonly kind: "slider";
  readonly options: readonly O[];
  readonly defaultValue: O;
}

export interface SelectControl<
  P extends string = string,
  O extends string = string,
> extends ControlBase<P> {
  readonly kind: "select";
  readonly options: readonly O[];
  readonly defaultValue: O;
}

export interface SwitchControl<P extends string = string> extends ControlBase<P> {
  readonly kind: "switch";
  readonly defaultValue: boolean;
}

export interface TextControl<P extends string = string> extends ControlBase<P> {
  readonly kind: "text";
  readonly defaultValue: string;
}

export type Control = SwatchesControl | SliderControl | SelectControl | SwitchControl | TextControl;

export type ControlValue = string | boolean;

type ValueOf<C extends Control> = C extends SwitchControl
  ? boolean
  : C extends TextControl
    ? string
    : C extends { readonly options: readonly (infer O)[] }
      ? O
      : never;

export type ControlValues<C extends readonly Control[]> = {
  -readonly [K in C[number] as K["prop"]]: ValueOf<K>;
};

// `const` keeps props and options as literals, so values are typed per control.
export function defineControls<const C extends readonly Control[]>(controls: C): C {
  return controls;
}
