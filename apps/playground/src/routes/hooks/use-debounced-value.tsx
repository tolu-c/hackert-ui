import { useDebouncedValue } from "@hackert-ui/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";

const CONTROLS = defineControls([
  {
    kind: "slider",
    prop: "delay",
    label: "Delay (ms)",
    options: ["100", "200", "400", "800", "1600"],
    defaultValue: "400",
  },
]);

const IMPORT = 'import { useDebouncedValue } from "@hackert-ui/hooks";';

export const Route = createFileRoute("/hooks/use-debounced-value")({
  ...searchOptionsFor(CONTROLS),
  component: UseDebouncedValuePage,
});

function UseDebouncedValuePage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const delay = Number(values.delay);

  return (
    <div>
      <PageHeader
        title="useDebouncedValue"
        packageName="@hackert-ui/hooks"
        description="Returns the value only after it has stopped changing for the given delay. Each change restarts the timer."
        importLine={IMPORT}
      />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={`${IMPORT}\n\nfunction Demo() {\n  const [query, setQuery] = useState("");\n  const debounced = useDebouncedValue(query, ${delay});\n}`}
      >
        <DebounceDemo delay={delay} />
      </Configurator>
    </div>
  );
}

function DebounceDemo({ delay }: { readonly delay: number }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, delay);
  const waiting = query !== debounced;

  return (
    <div className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-900">
          Type something
        </label>
        <input
          id={id}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        />
      </div>
      <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
        <dt className="text-slate-500">Live</dt>
        <dd className="truncate font-mono">{query || "—"}</dd>
        <dt className="text-slate-500">Debounced</dt>
        <dd className="truncate font-mono">{debounced || "—"}</dd>
      </dl>
      <p
        className={`text-xs text-amber-600 transition-opacity duration-150 ${waiting ? "opacity-100" : "opacity-0"}`}
        aria-live="polite"
      >
        {waiting ? `waiting ${delay}ms…` : ""}
      </p>
    </div>
  );
}
