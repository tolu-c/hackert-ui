import { catalogPage } from "@/catalog";
import { packageId } from "@/install";
import type { FileRoutesByTo } from "@/routeTree.gen";
import { CodeBlock } from "./CodeBlock";
import { InstallBlock } from "./InstallBlock";

interface PageHeaderProps {
  readonly to: keyof FileRoutesByTo;
  readonly importLine?: string | undefined;
}

export function PageHeader({ to, importLine }: PageHeaderProps) {
  const { item, section } = catalogPage(to);

  return (
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">{item.label}</h1>
      <p className="mt-3 max-w-2xl text-fg-secondary">{item.description}</p>

      <h2 className="mt-10 mb-3 text-xl font-semibold tracking-tight">Installation</h2>
      <InstallBlock packages={[packageId(section.packageName)]} />

      {importLine ? (
        <>
          <h2 className="mt-8 mb-3 text-xl font-semibold tracking-tight">Import</h2>
          <div className="overflow-hidden rounded-lg">
            <CodeBlock code={importLine} />
          </div>
        </>
      ) : null}
    </header>
  );
}
