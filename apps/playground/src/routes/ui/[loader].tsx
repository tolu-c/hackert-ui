import { Button, Loader } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const CONTROLS = defineControls([
  {
    kind: "select",
    prop: "type",
    label: "Type",
    options: ["oval", "bars", "dots"],
    defaultValue: "oval",
  },
  {
    kind: "swatches",
    prop: "color",
    label: "Color",
    options: ["primary", "secondary", "success", "danger", "warning"],
    defaultValue: "primary",
  },
  {
    kind: "slider",
    prop: "size",
    label: "Size",
    options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    defaultValue: "md",
  },
]);

const COMPONENT_DEFAULTS = { type: "oval", size: "md" };
const IMPORT = 'import { Loader } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/loader")({
  head: () => pageHead("/ui/loader"),
  ...searchOptionsFor(CONTROLS),
  component: LoaderPage,
});

function LoaderPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader to="/ui/loader" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("Loader", values, COMPONENT_DEFAULTS))}
      >
        <Loader {...values} />
      </Configurator>

      <Demo
        title="Custom size and colour"
        description="A number is a size in pixels, and color takes any CSS colour as well as a theme key."
        source={
          '<Loader size={28} color="tomato" />\n<Loader type="dots" size={28} color="#0ea5e9" />'
        }
      >
        <Loader size={28} color="tomato" />
        <Loader type="dots" size={28} color="#0ea5e9" />
      </Demo>

      <Demo
        title="Inherits text colour"
        description="Without a color, a loader paints with currentColor, so it matches the text around it."
        source={'<p className="text-fg-muted">\n  <Loader size={14} /> Syncing…\n</p>'}
      >
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader size={14} /> Syncing…
        </p>
        <Button loading>Save</Button>
      </Demo>
    </div>
  );
}
