import { DEFAULT_THEME } from "@hackert-ui/core";
import { Button, type ButtonSize, type ButtonVariant, Card } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "#/components/Demo";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/ui")({ component: UiRoute });

const VARIANTS = Object.keys(DEFAULT_THEME.colors) as ButtonVariant[];
const SIZES: readonly ButtonSize[] = ["sm", "md", "lg"];

function UiRoute() {
  return (
    <div>
      <PageHeader
        title="UI"
        packageName="@hackert-ui/ui"
        description="Component primitives themed from AppProvider. Text, hover and pressed colours are derived from each theme colour, and the styles sit in @layer components so your className always wins."
      />

      <Demo
        title="Button variants"
        description="One per theme colour. Text colour is picked for contrast; hover and press darken the background."
        source={`import { Button } from "@hackert-ui/ui";\n\n<Button variant="warning">Warning</Button>`}
      >
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Demo>

      <Demo
        title="Button sizes"
        description="Padding comes from the theme's spacing scale."
        source={`<Button size="sm">Small</Button>\n<Button size="lg">Large</Button>`}
      >
        {SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </Demo>

      <Demo
        title="Disabled"
        description="No hover or press feedback, and a not-allowed cursor."
        source={`<Button disabled>Unavailable</Button>`}
      >
        <Button disabled>Unavailable</Button>
      </Demo>

      <Demo
        title="Overriding with className"
        description="Consumer utilities beat the library's styles without !important."
        source={`<Button className="rounded-none uppercase tracking-wide">\n  Square\n</Button>`}
      >
        <Button className="rounded-none uppercase tracking-wide">Square</Button>
      </Demo>

      <Demo
        title="Card"
        description="A container. Accepts any ReactNode, not just a string."
        source={`import { Button, Card } from "@hackert-ui/ui";\n\n<Card>\n  <Button>Nested</Button>\n</Card>`}
      >
        <Card>
          <Button variant="success">Nested</Button>
        </Card>
      </Demo>
    </div>
  );
}
