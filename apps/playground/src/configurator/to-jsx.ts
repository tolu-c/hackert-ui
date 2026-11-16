import type { ControlValue } from "./controls";

const UNSAFE_CHILD = /[{}<>"]/;

export function toJsx(
  component: string,
  props: Readonly<Record<string, ControlValue>>,
  defaults: Readonly<Record<string, ControlValue>>,
  children = "",
): string {
  const attributes = Object.entries(props)
    .filter(([name, value]) => value !== defaults[name])
    .map(([name, value]) => toAttribute(name, value));

  const opening = [component, ...attributes].join(" ");

  if (children === "") {
    return `<${opening} />`;
  }

  const body = UNSAFE_CHILD.test(children) ? `{${JSON.stringify(children)}}` : children;
  return `<${opening}>${body}</${component}>`;
}

export function toSnippet(importLine: string, element: string): string {
  return `${importLine}\n\nfunction Demo() {\n  return ${element};\n}`;
}

function toAttribute(name: string, value: ControlValue): string {
  if (value === true) {
    return name;
  }
  if (value === false) {
    return `${name}={false}`;
  }
  return value.includes('"') ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`;
}
