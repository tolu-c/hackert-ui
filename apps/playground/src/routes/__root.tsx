import { AppProvider } from "@hackert-ui/core";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SECTION_LIST } from "@/catalog";
import { ColorSchemeSwitcher } from "@/components/ColorSchemeSwitcher";
import { GitHubIcon, GitHubLink } from "@/components/GitHubLink";
import { NEW_ISSUE_URL, REPO_URL } from "@/repo";

import "../styles.css";

export const Route = createRootRoute({ component: RootComponent });

const NAV_LINK = {
  className: "transition-colors",
  inactiveProps: { className: "text-fg-muted hover:text-fg" },
  activeProps: { className: "font-medium text-fg" },
} as const;

function RootComponent() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col bg-surface text-fg">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
            <span className="text-sm font-semibold tracking-tight">hackert-ui</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link to="/" {...NAV_LINK} activeOptions={{ exact: true }}>
                Overview
              </Link>
              {SECTION_LIST.map((section) => (
                <Link key={section.to} to={section.to} {...NAV_LINK}>
                  {section.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <GitHubLink />
              <ColorSchemeSwitcher />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
          <Outlet />
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-fg-muted">
            <p>
              Found a bug or missing a component?{" "}
              <a
                href={NEW_ISSUE_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
              >
                Open an issue
              </a>
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-2 transition-colors hover:text-fg"
            >
              <GitHubIcon className="size-3.5" />
              tolu-c/hackert-ui
            </a>
          </div>
        </footer>
      </div>

      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
      />
    </AppProvider>
  );
}
