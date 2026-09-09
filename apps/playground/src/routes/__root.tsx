import { AppProvider } from "@hackert-ui/core";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "../styles.css";

export const Route = createRootRoute({ component: RootComponent });

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/theme", label: "Theme" },
  { to: "/ui", label: "UI" },
  { to: "/form", label: "Form" },
  { to: "/hooks", label: "Hooks" },
] as const;

function RootComponent() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white text-slate-900">
        <header className="border-b border-slate-200">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-4">
            <span className="text-sm font-semibold tracking-tight">
              hackert-ui
            </span>
            <nav className="flex flex-wrap gap-4 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-slate-500 transition-colors hover:text-slate-900"
                  activeProps={{ className: "text-slate-900 font-medium" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12">
          <Outlet />
        </main>
      </div>

      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </AppProvider>
  );
}
