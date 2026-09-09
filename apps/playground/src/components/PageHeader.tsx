interface PageHeaderProps {
  readonly title: string;
  readonly packageName: string;
  readonly description: string;
}

export function PageHeader({
  title,
  packageName,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <code className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
        {packageName}
      </code>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">{description}</p>
    </header>
  );
}
