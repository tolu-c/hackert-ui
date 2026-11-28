import { useModalsStack } from "@hackert-ui/hooks";
import { Button } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";

const IMPORT = 'import { useModalsStack } from "@hackert-ui/hooks";';

const IDS = ["profile", "billing", "danger-zone"] as const;

export const Route = createFileRoute("/hooks/use-modals-stack")({
  head: () => pageHead("/hooks/use-modals-stack"),
  component: UseModalsStackPage,
});

function UseModalsStackPage() {
  return (
    <div>
      <PageHeader to="/hooks/use-modals-stack" importLine={IMPORT} />

      <Demo
        title="State and handlers"
        description="One boolean per id, with open, close, toggle and closeAll. register(id) returns the opened, onClose and stackId props for a Modal inside Modal.Stack. See the Modal page for the full stack."
        source={`${IMPORT}\n\nconst stack = useModalsStack(["profile", "billing", "danger-zone"]);\n\nstack.toggle("billing");\nstack.state; // { profile: false, billing: true, "danger-zone": false }\n<Modal {...stack.register("billing")} title="Billing" />`}
      >
        <StackStateDemo />
      </Demo>
    </div>
  );
}

function StackStateDemo() {
  const stack = useModalsStack(IDS);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {IDS.map((id) => (
          <Button
            key={id}
            size="sm"
            variant={stack.state[id] ? "filled" : "default"}
            onClick={() => stack.toggle(id)}
          >
            {id}
          </Button>
        ))}
        <Button size="sm" variant="subtle" color="danger" onClick={stack.closeAll}>
          closeAll
        </Button>
      </div>
      <pre className="rounded-lg bg-subtle p-3 text-xs text-fg-soft">
        {JSON.stringify(stack.state, null, 2)}
      </pre>
    </div>
  );
}
