import type { ReactNode } from "react";

export const DEMO_BUTTON =
  "rounded border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-slate-400";

interface DemoProps {
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly children: ReactNode;
}

export function Demo({ title, description, source, children }: DemoProps) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 p-6">{children}</div>
        <pre className="overflow-x-auto border-t border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          <code>{source}</code>
        </pre>
      </div>
    </section>
  );
}
