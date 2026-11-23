import type { PackageName } from "./install";
import type { FileRoutesByTo } from "./routeTree.gen";

type RoutePath = keyof FileRoutesByTo;

export interface CatalogItem {
  readonly to: RoutePath;
  readonly label: string;
  // The page's lead paragraph and its meta description.
  readonly description: string;
  // Other exports this page documents, beyond the one named by `label`.
  readonly covers?: readonly string[];
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
      {
        to: "/theme/colors",
        label: "Colors",
        description:
          "Each theme colour is one value. useVariantColors derives readable text and hover and pressed colours from it, in light and dark mode.",
      },
      {
        to: "/theme/spacing",
        label: "Spacing",
        description:
          "The spacing scale. Button padding is drawn from it: horizontal at the size, vertical one step smaller.",
      },
      {
        to: "/theme/radius",
        label: "Radius",
        description: "The corner radius scale, used by Button's radius prop.",
      },
    ],
  },
  ui: {
    to: "/ui",
    label: "UI",
    packageName: "@hackert-ui/ui",
    blurb: "Themed component primitives.",
    items: [
      {
        to: "/ui/button",
        label: "Button",
        description:
          "A themed button. Text, hover and pressed colours are derived from the variant's theme colour, and its styles sit in @layer components so your className always wins.",
      },
      {
        to: "/ui/card",
        label: "Card",
        description:
          "A container that accepts any ReactNode and its native div props. It ships unstyled, so its appearance comes from your className.",
      },
    ],
  },
  form: {
    to: "/form",
    label: "Form",
    packageName: "@hackert-ui/form",
    blurb: "TanStack Form components with accessible labels, descriptions and errors.",
    items: [
      {
        to: "/form/form",
        label: "Form",
        description:
          "Wires useAppForm to a <form>, with FormField for the label, description and error, and a SubmitButton and FormError that read the form. A login example with async submit and server errors.",
        covers: [
          "FormField",
          "SubmitButton",
          "FormError",
          "useAppForm",
          "withForm",
          "fieldContext",
          "formContext",
          "useFieldContext",
          "useFormContext",
        ],
      },
      {
        to: "/form/text-input",
        label: "TextInput",
        description:
          "A text field component for TanStack Form. Its id, aria-invalid and aria-describedby come from the surrounding FormField.",
      },
      {
        to: "/form/text-area",
        label: "TextArea",
        description: "A multi-line text field with the same wiring as TextInput.",
      },
      {
        to: "/form/number-input",
        label: "NumberInput",
        description:
          "A locale-aware number field that groups digits as you type, keeps the caret in place and shows the currency symbol as an affix. The field value is a number or null.",
      },
      {
        to: "/form/select-input",
        label: "SelectInput",
        description:
          "A native select, a searchable combobox whose value must be an option, or an autocomplete that suggests options while keeping free text.",
      },
    ],
  },
  hooks: {
    to: "/hooks",
    label: "Hooks",
    packageName: "@hackert-ui/hooks",
    blurb: "Stateful helpers with stable handlers.",
    items: [
      {
        to: "/hooks/use-disclosure",
        label: "useDisclosure",
        description:
          "Boolean open state with open, close and toggle handlers. Handlers are referentially stable, and onOpen/onClose fire only on an actual transition.",
      },
      {
        to: "/hooks/use-debounced-value",
        label: "useDebouncedValue",
        description:
          "Returns the value only after it has stopped changing for the given delay. Each change restarts the timer.",
      },
    ],
  },
} as const satisfies Readonly<Record<string, CatalogSection>>;

export const SECTION_LIST: readonly CatalogSection[] = [
  SECTIONS.theme,
  SECTIONS.ui,
  SECTIONS.form,
  SECTIONS.hooks,
];

export const SITE_TITLE = "hackert-ui";
export const SITE_DESCRIPTION =
  "A React 19 component library split into packages: theme, UI primitives, form controls and hooks. Themeable, dark-mode ready, built for Tailwind v4.";

export interface CatalogPage {
  readonly item: CatalogItem;
  readonly section: CatalogSection;
}

const PAGES = new Map<RoutePath, CatalogPage>(
  SECTION_LIST.flatMap((section) => section.items.map((item) => [item.to, { item, section }])),
);

export function catalogPage(to: RoutePath): CatalogPage {
  const page = PAGES.get(to);
  if (!page) {
    throw new Error(`playground: ${to} has no entry in catalog.ts`);
  }
  return page;
}

// Route `head` for a catalog page: "<label> · hackert-ui" plus its description.
export function pageHead(to: RoutePath) {
  const { item } = catalogPage(to);
  return {
    meta: [
      { title: `${item.label} · ${SITE_TITLE}` },
      { name: "description", content: item.description },
      { property: "og:title", content: `${item.label} · ${SITE_TITLE}` },
      { property: "og:description", content: item.description },
    ],
  };
}
