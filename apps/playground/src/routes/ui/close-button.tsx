import { CloseButton } from "@hackert-ui/ui";
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
    kind: "slider",
    prop: "size",
    label: "Size",
    options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    defaultValue: "md",
  },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { size: "md", disabled: false };
const IMPORT = 'import { CloseButton } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/close-button")({
  head: () => pageHead("/ui/close-button"),
  ...searchOptionsFor(CONTROLS),
  component: CloseButtonPage,
});

function CloseButtonPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader to="/ui/close-button" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("CloseButton", values, COMPONENT_DEFAULTS))}
      >
        <CloseButton {...values} />
      </Configurator>

      <Demo
        title="Custom label and icon"
        description='Its accessible name defaults to "Close". Pass aria-label for another, and children to replace the icon.'
        source={
          '<CloseButton aria-label="Dismiss notification">\n  <span aria-hidden="true">Esc</span>\n</CloseButton>'
        }
      >
        <CloseButton aria-label="Dismiss notification" size="xl" className="text-xs font-medium">
          <span aria-hidden="true">Esc</span>
        </CloseButton>
      </Demo>
    </div>
  );
}
