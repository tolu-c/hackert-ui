import { Input } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "@/components/Demo";
import { pageHead } from "@/catalog";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const CONTROLS = defineControls([
  { kind: "text", prop: "label", label: "Label", defaultValue: "Email" },
  { kind: "text", prop: "placeholder", label: "Placeholder", defaultValue: "you@example.com" },
  {
    kind: "select",
    prop: "type",
    label: "Type",
    options: ["text", "email", "password", "number"],
    defaultValue: "email",
  },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { label: "", placeholder: "", type: "text", disabled: false };
const IMPORT = 'import { Input } from "@hackert-ui/form";';

export const Route = createFileRoute("/form/input")({
  head: () => pageHead("/form/input"),
  ...searchOptionsFor(CONTROLS),
  component: InputPage,
});

function InputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader to="/form/input" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("Input", values, COMPONENT_DEFAULTS))}
      >
        <Input {...values} label={values.label || undefined} />
      </Configurator>

      <Demo
        title="Without a label"
        description="The label is optional; the input still renders."
        source={'<Input placeholder="Search" />'}
      >
        <Input placeholder="Search" />
      </Demo>
    </div>
  );
}
