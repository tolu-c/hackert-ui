export type SelectPrimitive = string | number | boolean;

export interface SelectOptionObject<TValue extends SelectPrimitive = string> {
  readonly value: TValue;
  readonly label?: string | undefined;
  readonly disabled?: boolean | undefined;
}

// One option: a bare value (labelled by itself) or an object.
export type SelectOptionInput<TValue extends SelectPrimitive = string> =
  | TValue
  | SelectOptionObject<TValue>;

export interface SelectGroup<TValue extends SelectPrimitive = string> {
  readonly group: string;
  readonly items: readonly SelectOptionInput<TValue>[];
}

// What `options` accepts: options and groups of options, mixed freely.
export type SelectData<TValue extends SelectPrimitive = string> = readonly (
  | SelectOptionInput<TValue>
  | SelectGroup<TValue>
)[];

export interface SelectOption<TValue extends SelectPrimitive = string> {
  readonly value: TValue;
  readonly label: string;
  readonly disabled: boolean;
  readonly group?: string | undefined;
}

function isGroup<TValue extends SelectPrimitive>(
  item: SelectOptionInput<TValue> | SelectGroup<TValue>,
): item is SelectGroup<TValue> {
  return typeof item === "object" && "group" in item;
}

function toOption<TValue extends SelectPrimitive>(
  item: SelectOptionInput<TValue>,
  group: string | undefined,
): SelectOption<TValue> {
  const object = typeof item === "object" ? item : { value: item };
  const option = {
    value: object.value,
    label: object.label ?? String(object.value),
    disabled: object.disabled ?? false,
  };
  return group === undefined ? option : { ...option, group };
}

export function normalizeOptions<TValue extends SelectPrimitive>(
  data: SelectData<TValue>,
): SelectOption<TValue>[] {
  return data.flatMap((item) =>
    isGroup(item)
      ? item.items.map((child) => toOption(child, item.group))
      : [toOption(item, undefined)],
  );
}

const DIACRITICS = /\p{Diacritic}/gu;

function fold(text: string) {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

export function filterOptions<TValue extends SelectPrimitive>(
  options: readonly SelectOption<TValue>[],
  query: string,
) {
  const needle = fold(query.trim());
  if (!needle) return options;
  return options.filter((option) => fold(option.label).includes(needle));
}
