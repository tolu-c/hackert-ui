import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

interface DemoProps {
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly children: ReactNode;
}

export function Demo({ title, description, source, children }: DemoProps) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="flex min-h-32 flex-wrap items-center justify-center gap-3 p-8">
          {children}
        </div>
        <div className="border-t border-line">
          <CodeBlock code={source} />
        </div>
      </div>
    </section>
  );
}
