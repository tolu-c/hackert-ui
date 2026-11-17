import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SECTION_LIST } from "@/catalog";
import { CodeBlock } from "@/components/CodeBlock";
import { GitHubLink } from "@/components/GitHubLink";
import { InstallBlock } from "@/components/InstallBlock";
import { ISSUES_URL } from "@/repo";

export const Route = createFileRoute("/")({ component: Overview });

const SETUP = `import { AppProvider } from "@hackert-ui/core";
import { Button } from "@hackert-ui/ui";

export function App() {
  return (
    <AppProvider theme={{ colors: { primary: "#0f766e" } }}>
      <Button>Save</Button>
    </AppProvider>
  );
}`;

const DARK_MODE = `/* Follow the OS… */
:root { color-scheme: light dark; }

/* …or, with a .dark class toggle */
.dark { color-scheme: dark; }`;

function Overview() {
  return (
    <div className="max-w-4xl">
      <header className="mb-14">
        <h1 className="text-3xl font-bold tracking-tight">hackert-ui</h1>
        <p className="mt-3 max-w-2xl text-fg-secondary">
          A shared React component library, split into packages so a project can take only what it
          needs.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <GitHubLink />
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
          >
            Report an issue
          </a>
        </div>
      </header>

      <section aria-labelledby="getting-started" className="mb-14">
        <h2 id="getting-started" className="text-xl font-semibold tracking-tight">
          Getting started
        </h2>
        <ol className="mt-6 space-y-10">
          <Step number={1} title="Install">
            <p>
              Install the packages you need. <code>@hackert-ui/ui</code> needs <code>core</code> and{" "}
              <code>utils</code> alongside it. The app needs React 19 and Tailwind v4.
            </p>
            <InstallBlock packages={["ui"]} />
          </Step>
          <Step number={2} title="Wrap your app">
            <p>
              <code>AppProvider</code> resolves the theme once; every component reads from it.
              Override only the tokens you want to change.
            </p>
            <div className="overflow-hidden rounded-lg">
              <CodeBlock code={SETUP} />
            </div>
          </Step>
          <Step number={3} title="Turn on dark mode">
            <p>
              Components carry both palettes and follow the page&apos;s CSS{" "}
              <code>color-scheme</code>, so there is nothing to pass in React.
            </p>
            <div className="overflow-hidden rounded-lg">
              <CodeBlock code={DARK_MODE} />
            </div>
          </Step>
        </ol>
      </section>

      <section aria-labelledby="packages">
        <h2 id="packages" className="text-xl font-semibold tracking-tight">
          Packages
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SECTION_LIST.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="rounded-lg border border-line p-5 transition-colors duration-150 hover:border-line-hover"
            >
              <code className="text-sm font-medium">{section.packageName}</code>
              <p className="mt-2 text-sm text-fg-muted">{section.blurb}</p>
              <p className="mt-3 text-xs text-fg-faint">
                {section.items.map((item) => item.label).join(" · ")}
              </p>
            </Link>
          ))}
          <div className="rounded-lg border border-dashed border-line p-5">
            <code className="text-sm font-medium">@hackert-ui/utils</code>
            <p className="mt-2 text-sm text-fg-muted">
              Framework-agnostic helpers — cn. No React dependency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StepProps {
  readonly number: number;
  readonly title: string;
  readonly children: ReactNode;
}

function Step({ number, title, children }: StepProps) {
  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-full border border-line font-mono text-xs text-fg-muted"
      >
        {number}
      </span>
      <div className="space-y-3 text-sm text-fg-secondary [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-fg-soft [&_pre_code]:bg-transparent [&_pre_code]:p-0">
        <h3 className="pt-1 text-base font-semibold text-fg">{title}</h3>
        {children}
      </div>
    </li>
  );
}
