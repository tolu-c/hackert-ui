import { useDisclosure } from "@hackert-ui/hooks";
import { Button } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { searchOptionsFor } from "@/configurator/search";

const CONTROLS = defineControls([
  { kind: "switch", prop: "initial", label: "Initially open", defaultValue: false },
]);

const IMPORT = 'import { useDisclosure } from "@hackert-ui/hooks";';

export const Route = createFileRoute("/hooks/use-disclosure")({
  ...searchOptionsFor(CONTROLS),
  component: UseDisclosurePage,
});

function UseDisclosurePage() {
  const values = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader
        title="useDisclosure"
        packageName="@hackert-ui/hooks"
        description="Boolean open state with open, close and toggle handlers. Handlers are referentially stable, and onOpen/onClose fire only on an actual transition."
        importLine={IMPORT}
      />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={`${IMPORT}\n\nfunction Demo() {\n  const [opened, { open, close, toggle }] = useDisclosure(${values.initial}, {\n    onOpen: () => log("onOpen"),\n    onClose: () => log("onClose"),\n  });\n}`}
      >
        {/* Remount when the initial state changes, since useDisclosure reads it once. */}
        <DisclosureDemo key={String(values.initial)} initial={values.initial} />
      </Configurator>
    </div>
  );
}

function DisclosureDemo({ initial }: { readonly initial: boolean }) {
  const [log, setLog] = useState<readonly string[]>([]);
  const [opened, handlers] = useDisclosure(initial, {
    onOpen: () => setLog((prev) => [...prev, "onOpen"]),
    onClose: () => setLog((prev) => [...prev, "onClose"]),
  });

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlers.open}>open</Button>
        <Button variant="secondary" onClick={handlers.close}>
          close
        </Button>
        <Button variant="secondary" onClick={handlers.toggle}>
          toggle
        </Button>
      </div>

      {opened ? (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm text-slate-700 transition-[opacity,transform] duration-200 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0">
          The panel is open.
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400">
          Closed
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        callbacks: {log.length > 0 ? log.join(" → ") : "none yet"}
      </p>
    </div>
  );
}
