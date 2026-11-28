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
          "A themed button in six variants: filled, light, outline, subtle, transparent and a neutral default. color takes a theme key or any CSS colour, and text, hover and pressed colours are derived from it. It has left and right sections, full width, and a loading spinner, and its styles sit in @layer components so your className always wins.",
      },
      {
        to: "/ui/card",
        label: "Card",
        description:
          "A container that accepts any ReactNode and its native div props. It ships unstyled, so its appearance comes from your className.",
      },
      {
        to: "/ui/modal",
        label: "Modal",
        description:
          "A dialog on the native <dialog> element: focus is trapped, the page behind is inert and locked, and only the body scrolls under a fixed header. Use the props or compose Modal.Root, Header, Title and Body yourself, and group modals with Modal.Stack.",
      },
      {
        to: "/ui/close-button",
        label: "CloseButton",
        description:
          'An icon button with an X, named "Close" for screen readers. Modal uses it in its header.',
      },
      {
        to: "/ui/notification",
        label: "Notification",
        description:
          "Toasts you can raise from anywhere. Mount <Notifications /> once, then call notifications.show(), update(), hide() or clean(). Timers pause on hover, focus and hidden tabs; extras queue past the limit. Notification is the card on its own.",
        covers: ["Notifications", "notifications", "useNotify", "useNotifications"],
      },
      {
        to: "/ui/loader",
        label: "Loader",
        description:
          "A spinning oval, bouncing bars or pulsing dots. It paints with the surrounding text colour unless given a theme key or CSS colour, and takes a size key or a number of pixels.",
      },
      {
        to: "/ui/skeleton",
        label: "Skeleton",
        description:
          "A placeholder for content that is still loading. Size it with height and width, or wrap the real content and toggle visible: the content keeps its size and state underneath.",
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
        to: "/form/phone-input",
        label: "PhoneInput",
        description:
          "A phone number field with a searchable country picker. It formats as you type, recognises numbers typed with +, and stores the number in E.164.",
      },
      {
        to: "/form/select-input",
        label: "SelectInput",
        description:
          "A select with a styled dropdown, a searchable combobox whose value must be an option, or an autocomplete that keeps free text. Options can be strings, numbers, booleans, objects or groups. Select is the same control without TanStack Form.",
        covers: ["Select"],
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
      {
        to: "/hooks/use-copy",
        label: "useCopy",
        description: "Copies text to the clipboard and reports for a moment that it worked.",
      },
      {
        to: "/hooks/use-modals-stack",
        label: "useModalsStack",
        description:
          "Opened state for a group of modals by id, with open, close, toggle and closeAll. register(id) wires a Modal into Modal.Stack.",
      },
      {
        to: "/hooks/use-click-outside",
        label: "useClickOutside",
        description: "Calls back when a pointer or touch lands outside the referenced element.",
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
