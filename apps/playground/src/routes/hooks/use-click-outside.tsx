import { useClickOutside } from "@hackert-ui/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";

const IMPORT = 'import { useClickOutside } from "@hackert-ui/hooks";';

export const Route = createFileRoute("/hooks/use-click-outside")({
  head: () => pageHead("/hooks/use-click-outside"),
  component: UseClickOutsidePage,
});

function UseClickOutsidePage() {
  return (
    <div>
      <PageHeader to="/hooks/use-click-outside" importLine={IMPORT} />

      <Demo
        title="Dismiss on outside click"
        description="The returned ref marks the element. A mouse or touch press anywhere else calls the callback. An inline callback is fine; the listener is not re-attached."
        source={`${IMPORT}\n\nfunction Demo({ onClose }: { onClose: () => void }) {\n  const ref = useClickOutside<HTMLDivElement>(() => onClose());\n\n  return <div ref={ref}>Click outside me</div>;\n}`}
      >
        <UseClickOutsideDemo />
      </Demo>
    </div>
  );
}

function UseClickOutsideDemo() {
  const [outsideClicks, setOutsideClicks] = useState(0);
  const ref = useClickOutside<HTMLDivElement>(() => setOutsideClicks((count) => count + 1));

  return (
    <div className="text-center">
      <div ref={ref} className="rounded-lg border border-line p-6 text-sm">
        Click inside me: nothing happens
      </div>
      <p className="mt-3 text-xs text-fg-muted">Outside clicks: {outsideClicks}</p>
    </div>
  );
}
