import { CodeBlock } from "./CodeBlock";

interface PageHeaderProps {
  readonly title: string;
  readonly packageName: string;
  readonly description: string;
  readonly importLine?: string | undefined;
}

export function PageHeader({ title, packageName, description, importLine }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      <dl className="mt-5 grid grid-cols-[5rem_1fr] gap-y-2 text-sm">
        <dt className="text-slate-500">Package</dt>
        <dd>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
            {packageName}
          </code>
        </dd>
      </dl>
      {importLine ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <CodeBlock code={importLine} />
        </div>
      ) : null}
    </header>
  );
}
