import { Button, type ButtonVariant } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "@/components/Demo";
import { pageHead } from "@/catalog";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const SCALE = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
const VARIANTS = [
  "filled",
  "light",
  "outline",
  "subtle",
  "transparent",
  "default",
] as const satisfies readonly ButtonVariant[];

const CONTROLS = defineControls([
  { kind: "select", prop: "variant", label: "Variant", options: VARIANTS, defaultValue: "filled" },
  {
    kind: "swatches",
    prop: "color",
    label: "Color",
    options: ["primary", "secondary", "success", "danger", "warning"],
    defaultValue: "primary",
  },
  { kind: "slider", prop: "size", label: "Size", options: SCALE, defaultValue: "md" },
  { kind: "slider", prop: "radius", label: "Radius", options: SCALE, defaultValue: "md" },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
  { kind: "switch", prop: "loading", label: "Loading", defaultValue: false },
  { kind: "switch", prop: "fullWidth", label: "Full width", defaultValue: false },
  { kind: "text", prop: "label", label: "Label", defaultValue: "Button" },
]);

const COMPONENT_DEFAULTS = {
  variant: "filled",
  color: "primary",
  size: "md",
  radius: "md",
  disabled: false,
  loading: false,
  fullWidth: false,
};
const IMPORT = 'import { Button } from "@hackert-ui/ui";';

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const PlusIcon = (
  <svg {...ICON_PROPS}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ArrowIcon = (
  <svg {...ICON_PROPS}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ChevronIcon = (
  <svg {...ICON_PROPS}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Route = createFileRoute("/ui/button")({
  head: () => pageHead("/ui/button"),
  ...searchOptionsFor(CONTROLS),
  component: ButtonPage,
});

function ButtonPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const { label, ...props } = values;

  return (
    <div>
      <PageHeader to="/ui/button" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("Button", props, COMPONENT_DEFAULTS, label))}
      >
        <Button {...props}>{label}</Button>
      </Configurator>

      <Demo
        title="Variants"
        description="variant sets how the colour is drawn. default is a neutral bordered button that ignores color."
        source={VARIANTS.map((variant) => `<Button variant="${variant}">${variant}</Button>`).join(
          "\n",
        )}
      >
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Demo>

      <Demo
        title="Any colour"
        description="color takes a theme key or any CSS colour: a name, hex, rgb() or oklch(). Text and hover colours are derived from it and stay readable."
        source={
          '<Button color="tomato">Tomato</Button>\n<Button color="#0d9488" variant="light">Teal</Button>\n<Button color="oklch(0.55 0.22 300)" variant="outline">Violet</Button>'
        }
      >
        <Button color="tomato">Tomato</Button>
        <Button color="#0d9488" variant="light">
          Teal
        </Button>
        <Button color="oklch(0.55 0.22 300)" variant="outline">
          Violet
        </Button>
      </Demo>

      <Demo
        title="Sections"
        description='leftSection and rightSection hold an icon or any element. justify="space-between" pushes them to the edges, which suits a full-width button.'
        source={
          '<Button leftSection={<PlusIcon />}>New project</Button>\n<Button variant="default" rightSection={<ArrowIcon />}>Continue</Button>\n<Button\n  fullWidth\n  justify="space-between"\n  variant="light"\n  leftSection={<PlusIcon />}\n  rightSection={<ChevronIcon />}\n>\n  Add to workspace\n</Button>'
        }
      >
        <Button leftSection={PlusIcon}>New project</Button>
        <Button variant="default" rightSection={ArrowIcon}>
          Continue
        </Button>
        <div className="w-full max-w-xs">
          <Button
            fullWidth
            justify="space-between"
            variant="light"
            leftSection={PlusIcon}
            rightSection={ChevronIcon}
          >
            Add to workspace
          </Button>
        </div>
      </Demo>

      <Demo
        title="Loading"
        description="A spinner replaces the label without changing the button's width or colour. It is disabled and sets aria-busy. loaderProps picks the spinner."
        source={
          '<Button loading>Save</Button>\n<Button loading variant="light" loaderProps={{ type: "dots" }}>\n  Save\n</Button>\n<Button loading variant="default" loaderProps={{ type: "bars" }}>\n  Save\n</Button>'
        }
      >
        <Button loading>Save</Button>
        <Button loading variant="light" loaderProps={{ type: "dots" }}>
          Save
        </Button>
        <Button loading variant="default" loaderProps={{ type: "bars" }}>
          Save
        </Button>
      </Demo>

      <Demo
        title="Disabled state"
        description="No hover or press feedback, and a not-allowed cursor."
        source="<Button disabled>Unavailable</Button>"
      >
        <Button disabled>Unavailable</Button>
      </Demo>

      <Demo
        title="Custom className"
        description="Consumer utilities beat the library's styles without !important."
        source={'<Button className="rounded-none uppercase tracking-wide">\n  Square\n</Button>'}
      >
        <Button className="rounded-none uppercase tracking-wide">Square</Button>
      </Demo>
    </div>
  );
}
