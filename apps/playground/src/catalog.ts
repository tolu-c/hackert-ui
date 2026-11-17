import type { PackageName } from "./install";
import type { FileRoutesByTo } from "./routeTree.gen";

type RoutePath = keyof FileRoutesByTo;

export interface CatalogItem {
  readonly to: RoutePath;
  readonly label: string;
}

export interface CatalogSection {
  readonly to: RoutePath;
  readonly label: string;
  readonly packageName: PackageName;
  readonly blurb: string;
  readonly items: readonly CatalogItem[];
}

export const SECTIONS = {
  theme: {
    to: "/theme",
    label: "Theme",
    packageName: "@hackert-ui/core",
    blurb: "AppProvider, the design tokens, and the colours derived from them.",
    items: [
      { to: "/theme/colors", label: "Colors" },
      { to: "/theme/spacing", label: "Spacing" },
      { to: "/theme/radius", label: "Radius" },
    ],
  },
  ui: {
    to: "/ui",
    label: "UI",
    packageName: "@hackert-ui/ui",
    blurb: "Themed component primitives.",
    items: [
      { to: "/ui/button", label: "Button" },
      { to: "/ui/card", label: "Card" },
    ],
  },
  form: {
    to: "/form",
    label: "Form",
    packageName: "@hackert-ui/form",
    blurb: "Form controls with labels wired to inputs.",
    items: [{ to: "/form/input", label: "Input" }],
  },
  hooks: {
    to: "/hooks",
    label: "Hooks",
    packageName: "@hackert-ui/hooks",
    blurb: "Stateful helpers with stable handlers.",
    items: [
      { to: "/hooks/use-disclosure", label: "useDisclosure" },
      { to: "/hooks/use-debounced-value", label: "useDebouncedValue" },
    ],
  },
} as const satisfies Readonly<Record<string, CatalogSection>>;

export const SECTION_LIST: readonly CatalogSection[] = [
  SECTIONS.theme,
  SECTIONS.ui,
  SECTIONS.form,
  SECTIONS.hooks,
];
