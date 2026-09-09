import { Button, Card } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "#/components/Demo";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/ui")({ component: UiRoute });

function UiRoute() {
  return (
    <div>
      <PageHeader
        title="UI"
        packageName="@hackert-ui/ui"
        description="Component primitives. These are intentionally unstyled today — the styling strategy is the next decision."
      />

      <Demo
        title="Button"
        description="Renders a type=button element."
        source={`import { Button } from "@hackert-ui/ui";\n\n<Button>Save changes</Button>`}
      >
        <Button>Save changes</Button>
      </Demo>

      <Demo
        title="Card"
        description="A container. Accepts any ReactNode, not just a string."
        source={`import { Button, Card } from "@hackert-ui/ui";\n\n<Card>\n  <Button>Nested</Button>\n</Card>`}
      >
        <Card>
          <Button>Nested</Button>
        </Card>
      </Demo>
    </div>
  );
}
