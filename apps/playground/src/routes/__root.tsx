import { AppProvider } from "@hackert-ui/core";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SECTION_LIST } from "@/catalog";

import "../styles.css";

export const Route = createRootRoute({ component: RootComponent });

function RootComponent() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white text-slate-900">
        <header className="border-b border-slate-200">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4">
            <span className="text-sm font-semibold tracking-tight">hackert-ui</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link
                to="/"
                className="transition-colors"
                inactiveProps={{ className: "text-slate-500 hover:text-slate-900" }}
                activeProps={{ className: "font-medium text-slate-900" }}
                activeOptions={{ exact: true }}
              >
                Overview
              </Link>
              {SECTION_LIST.map((section) => (
                <Link
                  key={section.to}
                  to={section.to}
                  className="transition-colors"
                  inactiveProps={{ className: "text-slate-500 hover:text-slate-900" }}
                  activeProps={{ className: "font-medium text-slate-900" }}
                >
                  {section.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">
          <Outlet />
        </main>
      </div>

      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
      />
    </AppProvider>
  );
}
