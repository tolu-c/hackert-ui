import { type PackageName, packageId } from "@/install";
import { CodeBlock } from "./CodeBlock";
import { InstallBlock } from "./InstallBlock";

interface PageHeaderProps {
  readonly title: string;
  readonly packageName: PackageName;
  readonly description: string;
  readonly importLine?: string | undefined;
}

export function PageHeader({ title, packageName, description, importLine }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-fg-secondary">{description}</p>

      <h2 className="mt-10 mb-3 text-xl font-semibold tracking-tight">Installation</h2>
      <InstallBlock packages={[packageId(packageName)]} />

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
