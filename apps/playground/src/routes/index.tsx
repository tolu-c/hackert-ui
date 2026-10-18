import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Overview });

const PACKAGES = [
  {
    to: "/theme",
    name: "@hackert-ui/core",
    blurb: "AppProvider and the design token set every other package reads.",
  },
  {
    to: "/ui",
    name: "@hackert-ui/ui",
    blurb: "Component primitives — Button, Card.",
  },
  {
    to: "/form",
    name: "@hackert-ui/form",
    blurb: "Form controls with labels wired to inputs.",
  },
  {
    to: "/hooks",
    name: "@hackert-ui/hooks",
    blurb: "Stateful helpers — useDisclosure, useDebouncedValue.",
  },
  {
    to: null,
    name: "@hackert-ui/utils",
    blurb: "Framework-agnostic helpers — cn. No React dependency.",
  },
] as const;

const CARD = "rounded-lg border border-slate-200 p-5";

function Overview() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">hackert-ui</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A shared React component library, split into packages so a project can take only what it
          needs.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {PACKAGES.map((pkg) => {
          const body = (
            <>
              <code className="text-sm font-medium">{pkg.name}</code>
              <p className="mt-2 text-sm text-slate-500">{pkg.blurb}</p>
            </>
          );

          return pkg.to === null ? (
            <div key={pkg.name} className={`${CARD} border-dashed`}>
              {body}
            </div>
          ) : (
            <Link
              key={pkg.name}
              to={pkg.to}
              className={`${CARD} transition-colors hover:border-slate-400`}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
