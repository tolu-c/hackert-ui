import { Button, Skeleton } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const CONTROLS = defineControls([
  {
    kind: "slider",
    prop: "radius",
    label: "Radius",
    options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    defaultValue: "sm",
  },
  { kind: "switch", prop: "circle", label: "Circle", defaultValue: false },
  { kind: "switch", prop: "animate", label: "Animate", defaultValue: true },
]);

const COMPONENT_DEFAULTS = { radius: "sm", circle: false, animate: true };
const IMPORT = 'import { Skeleton } from "@hackert-ui/ui";';

export const Route = createFileRoute("/ui/skeleton")({
  head: () => pageHead("/ui/skeleton"),
  ...searchOptionsFor(CONTROLS),
  component: SkeletonPage,
});

const CARD_SOURCE = `<div className="flex items-center gap-3">
  <Skeleton height={48} circle />
  <div className="flex flex-1 flex-col gap-2">
    <Skeleton height={10} width="60%" />
    <Skeleton height={10} />
    <Skeleton height={10} width="80%" />
  </div>
</div>`;

const CONTENT_SOURCE = `const [loading, setLoading] = useState(true);

<Skeleton visible={loading}>
  Lorem ipsum dolor sit amet…
</Skeleton>
<Button onClick={() => setLoading((l) => !l)}>Toggle Skeleton</Button>`;

function SkeletonPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const size = values.circle ? { height: 48 } : { height: 48, width: 240 };
  const sizeAttributes = values.circle ? "height={48}" : "height={48} width={240}";

  return (
    <div>
      <PageHeader to="/ui/skeleton" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          toJsx("Skeleton", values, COMPONENT_DEFAULTS).replace(
            "<Skeleton",
            `<Skeleton ${sizeAttributes}`,
          ),
        )}
      >
        <Skeleton {...size} {...values} />
      </Configurator>

      <Demo
        title="Loading card"
        description="Compose placeholders in the shape of the content that is on its way."
        source={CARD_SOURCE}
      >
        <div className="flex w-full max-w-sm items-center gap-3">
          <Skeleton height={48} circle />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton height={10} width="60%" />
            <Skeleton height={10} />
            <Skeleton height={10} width="80%" />
          </div>
        </div>
      </Demo>

      <Demo
        title="Wrapping content"
        description="With children, the skeleton takes the content's exact size and covers it until visible is false. The content stays mounted, so its state survives the toggle."
        source={CONTENT_SOURCE}
      >
        <ContentDemo />
      </Demo>
    </div>
  );
}

function ContentDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <Skeleton visible={loading}>
        <p className="text-sm text-fg-soft">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tincidunt, arcu at
          sodales luctus, risus justo pulvinar nibh, a elementum mi ligula sed magna.
        </p>
      </Skeleton>
      <Button onClick={() => setLoading((current) => !current)}>Toggle Skeleton</Button>
    </div>
  );
}
