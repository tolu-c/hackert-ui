import { Modal } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const CONTROLS = defineControls([
  { kind: "text", prop: "content", label: "Content", defaultValue: "Modal" },
]);

const COMPONENT_DEFAULTS = {};
const IMPORT = 'import { Modal } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/modal")({
  head: () => pageHead("/ui/modal"),
  ...searchOptionsFor(CONTROLS),
  component: ModalPage,
});

function ModalPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const { content, ...props } = values;

  return (
    <div>
      <PageHeader to="/ui/modal" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("Modal", props, COMPONENT_DEFAULTS, content))}
      >
        <Modal {...props}>{content}</Modal>
      </Configurator>
    </div>
  );
}
