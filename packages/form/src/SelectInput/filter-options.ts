export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filterOptions(options: readonly SelectOption[], query: string) {
  const needle = normalize(query.trim());
  if (!needle) return options;
  return options.filter((option) => normalize(option.label).includes(needle));
}
