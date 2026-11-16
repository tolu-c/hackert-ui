import { createFileRoute, Link } from "@tanstack/react-router";
import { SECTION_LIST } from "#/catalog";

export const Route = createFileRoute("/")({ component: Overview });

function Overview() {
  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">hackert-ui</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A shared React component library, split into packages so a project can take only what it
          needs.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTION_LIST.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-lg border border-slate-200 p-5 transition-colors duration-150 hover:border-slate-400"
          >
            <code className="text-sm font-medium">{section.packageName}</code>
            <p className="mt-2 text-sm text-slate-500">{section.blurb}</p>
            <p className="mt-3 text-xs text-slate-400">
              {section.items.map((item) => item.label).join(" · ")}
            </p>
          </Link>
        ))}
        <div className="rounded-lg border border-dashed border-slate-200 p-5">
          <code className="text-sm font-medium">@hackert-ui/utils</code>
          <p className="mt-2 text-sm text-slate-500">
            Framework-agnostic helpers — cn. No React dependency.
          </p>
        </div>
      </div>
    </div>
  );
}
