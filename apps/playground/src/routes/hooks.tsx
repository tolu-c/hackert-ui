import { useDisclosure } from "@hackert-ui/hooks";
import { Button } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Demo } from "#/components/Demo";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/hooks")({ component: HooksRoute });

function HooksRoute() {
  const [log, setLog] = useState<string[]>([]);
  const [opened, handlers] = useDisclosure(false, {
    onOpen: () => setLog((prev) => [...prev, "onOpen"]),
    onClose: () => setLog((prev) => [...prev, "onClose"]),
  });

  return (
    <div>
      <PageHeader
        title="Hooks"
        packageName="@hackert-ui/hooks"
        description="Stateful helpers. Handlers are referentially stable, so they are safe to put in an effect dependency array."
      />

      <Demo
        title="useDisclosure"
        description="Callbacks fire on transition and the state still updates. Calling open() twice only notifies once."
        source={`const [opened, handlers] = useDisclosure(false, {\n  onOpen: () => log("onOpen"),\n  onClose: () => log("onClose"),\n});\n\nhandlers.open();\nhandlers.toggle();`}
      >
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handlers.open}>open</Button>
            <Button onClick={handlers.close}>close</Button>
            <Button onClick={handlers.toggle}>toggle</Button>
            <span className="text-sm text-slate-500">
              opened: <code className="font-medium">{String(opened)}</code>
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            callbacks: {log.length > 0 ? log.join(" → ") : "none yet"}
          </p>
        </div>
      </Demo>
    </div>
  );
}
