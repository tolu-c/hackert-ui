import { Button, Card } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { DEMO_BUTTON, Demo } from "#/components/Demo";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/ui")({ component: UiRoute });

function UiRoute() {
  return (
    <div>
      <PageHeader
        title="UI"
        packageName="@hackert-ui/ui"
        description="Component primitives. These ship unstyled — the styling strategy is the next decision — so every class below is supplied by the playground, the way a consuming app would."
      />

      <Demo
        title="Button"
        description="Renders a type=button element. Props spread after the defaults, so your className wins."
        source={`import { Button } from "@hackert-ui/ui";\n\n<Button className="${DEMO_BUTTON}">\n  Save changes\n</Button>`}
      >
        <Button className={DEMO_BUTTON}>Save changes</Button>
      </Demo>

      <Demo
        title="Card"
        description="A container. Accepts any ReactNode, not just a string."
        source={`import { Button, Card } from "@hackert-ui/ui";\n\n<Card>\n  <Button className="…">Nested</Button>\n</Card>`}
      >
        <Card>
          <Button className={DEMO_BUTTON}>Nested</Button>
        </Card>
      </Demo>
    </div>
  );
}
