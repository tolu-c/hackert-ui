import { Button } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const SCALE = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

const CONTROLS = defineControls([
  {
    kind: "swatches",
    prop: "variant",
    label: "Variant",
    options: ["primary", "secondary", "success", "danger", "warning"],
    defaultValue: "primary",
  },
  { kind: "slider", prop: "size", label: "Size", options: SCALE, defaultValue: "md" },
  { kind: "slider", prop: "radius", label: "Radius", options: SCALE, defaultValue: "md" },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
  { kind: "text", prop: "label", label: "Label", defaultValue: "Button" },
]);

const COMPONENT_DEFAULTS = { variant: "primary", size: "md", radius: "md", disabled: false };
const IMPORT = 'import { Button } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/button")({
  ...searchOptionsFor(CONTROLS),
  component: ButtonPage,
});

function ButtonPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const { label, ...props } = values;

  return (
    <div>
      <PageHeader
        title="Button"
        packageName="@hackert-ui/ui"
        description="A themed button. Text, hover and pressed colours are derived from the variant's theme colour, and its styles sit in @layer components so your className always wins."
        importLine={IMPORT}
      />

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
