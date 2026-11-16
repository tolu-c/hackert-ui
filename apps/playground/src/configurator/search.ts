import type { SearchMiddleware, SearchSchemaInput } from "@tanstack/react-router";
import type { Control, ControlValue, ControlValues } from "./controls";

export function defaultsFor<const C extends readonly Control[]>(controls: C): ControlValues<C> {
  return Object.fromEntries(
    controls.map((control) => [control.prop, control.defaultValue]),
  ) as ControlValues<C>;
}

// Returns every declared key, falling back to its default. The router merges
// this over the parent route's raw search, so omitting an invalid key would let
// the raw value through. SearchSchemaInput marks the input as optional, so
// <Link to> and redirects need no search.
export function validateSearchFor<const C extends readonly Control[]>(controls: C) {
  return (search: Partial<ControlValues<C>> & SearchSchemaInput): ControlValues<C> => {
    const raw: Readonly<Record<string, unknown>> = search;
    const valid: Record<string, ControlValue> = {};

    for (const control of controls) {
      valid[control.prop] = readValue(control, raw[control.prop]) ?? control.defaultValue;
    }

    return valid as ControlValues<C>;
  };
}

function readValue(control: Control, raw: unknown): ControlValue | undefined {
  switch (control.kind) {
    case "switch":
      return typeof raw === "boolean" ? raw : undefined;
    case "text":
      // Search params are JSON-parsed, so "?label=123" arrives as a number.
      return typeof raw === "string" || typeof raw === "number" ? String(raw) : undefined;
    case "swatches":
    case "slider":
    case "select":
      return (control.options as readonly unknown[]).includes(raw) ? (raw as string) : undefined;
  }
}

// Route options for a configurator page: validated params, with defaults kept
// out of the URL so an untouched demo has a clean link.
export function searchOptionsFor<const C extends readonly Control[]>(controls: C) {
  const defaults: Readonly<Record<string, ControlValue>> = defaultsFor(controls);

  const stripDefaults: SearchMiddleware<ControlValues<C>> = ({ search, next }) => {
    const result: Record<string, unknown> = { ...next(search) };
    for (const [key, value] of Object.entries(defaults)) {
      if (result[key] === value) {
        delete result[key];
      }
    }
    return result as ControlValues<C>;
  };

  return {
    validateSearch: validateSearchFor(controls),
    search: { middlewares: [stripDefaults] },
  };
}
