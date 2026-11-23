import { useCopy } from "@hackert-ui/hooks";
import { Button } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";

const IMPORT = 'import { useCopy } from "@hackert-ui/hooks";';

export const Route = createFileRoute("/hooks/use-copy")({
  head: () => pageHead("/hooks/use-copy"),
  component: UseCopyPage,
});

function UseCopyPage() {
  return (
    <div>
      <PageHeader to="/hooks/use-copy" importLine={IMPORT} />

      <Demo
        title="Copy with feedback"
        description="isCopied turns true after a successful copy and resets after the timeout. Copying again restarts the timer."
        source={`${IMPORT}\n\nfunction Demo() {\n  const { copy, isCopied } = useCopy({ timeout: 1500 });\n\n  return (\n    <button onClick={() => copy("npm i @hackert-ui/hooks")}>\n      {isCopied ? "Copied" : "Copy"}\n    </button>\n  );\n}`}
      >
        <UseCopyDemo />
      </Demo>
    </div>
  );
}

function UseCopyDemo() {
  const { copy, isCopied } = useCopy({ timeout: 1500 });

  return (
    <div className="flex items-center gap-3">
      <code className="rounded-md border border-line px-2 py-1 text-sm">
        pnpm add @hackert-ui/hooks
      </code>
      <Button onClick={() => copy("pnpm add @hackert-ui/hooks")}>
        {isCopied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
