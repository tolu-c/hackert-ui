import { Button, Card } from "@hackert-ui/ui";
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
  {
    kind: "text",
    prop: "className",
    label: "className",
    defaultValue: "rounded-lg border border-line p-6 shadow-sm",
  },
  { kind: "text", prop: "content", label: "Content", defaultValue: "Card content" },
]);

const COMPONENT_DEFAULTS = { className: "" };
const IMPORT = 'import { Card } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/card")({
  head: () => pageHead("/ui/card"),
  ...searchOptionsFor(CONTROLS),
  component: CardPage,
});

function CardPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const { content, ...props } = values;

  return (
    <div>
      <PageHeader to="/ui/card" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("Card", props, COMPONENT_DEFAULTS, content))}
      >
        <Card {...props}>{content}</Card>
      </Configurator>

      <Demo
        title="With nested components"
        description="Children can be any ReactNode, including other components."
        source={
          '<Card className="space-y-3 rounded-lg border border-line p-6">\n  <p>Unsaved changes</p>\n  <Button color="success">Save</Button>\n</Card>'
        }
      >
        <Card className="space-y-3 rounded-lg border border-line p-6">
          <p className="text-sm text-fg-soft">Unsaved changes</p>
          <Button color="success">Save</Button>
        </Card>
      </Demo>
    </div>
  );
}
