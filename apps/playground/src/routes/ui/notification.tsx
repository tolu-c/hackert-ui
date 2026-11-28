import { Button, Notification, Notifications, notifications } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";

const POSITIONS = [
  "bottom-right",
  "bottom-center",
  "bottom-left",
  "top-right",
  "top-center",
  "top-left",
] as const;

const CONTROLS = defineControls([
  {
    kind: "select",
    prop: "position",
    label: "Position",
    options: POSITIONS,
    defaultValue: "bottom-right",
  },
  {
    kind: "swatches",
    prop: "color",
    label: "Color",
    options: ["primary", "secondary", "success", "danger", "warning"],
    defaultValue: "primary",
  },
  { kind: "text", prop: "title", label: "Title", defaultValue: "Changes saved" },
  {
    kind: "text",
    prop: "message",
    label: "Message",
    defaultValue: "Your profile is up to date.",
  },
]);

const IMPORT = 'import { Notifications, notifications } from "@hackert-ui/ui";';

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const CheckIcon = (
  <svg {...ICON_PROPS}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AlertIcon = (
  <svg {...ICON_PROPS}>
    <path d="M12 8v5M12 16.5v.01" />
  </svg>
);

export const Route = createFileRoute("/ui/notification")({
  head: () => pageHead("/ui/notification"),
  ...searchOptionsFor(CONTROLS),
  component: NotificationPage,
});

function usageCode(values: { position: string; color: string; title: string; message: string }) {
  const position = values.position === "bottom-right" ? "" : ` position="${values.position}"`;
  const color = values.color === "primary" ? "" : `\n      color: "${values.color}",`;
  return `${IMPORT}

// Once, near the root of your app:
<Notifications${position} />

// Then from anywhere, even outside React:
function Demo() {
  return (
    <Button
      onClick={() =>
        notifications.show({
          title: ${JSON.stringify(values.title)},
          message: ${JSON.stringify(values.message)},${color}
        })
      }
    >
      Show notification
    </Button>
  );
}`;
}

const UPDATE_SOURCE = `const id = notifications.show({
  title: "Uploading report.pdf",
  message: "This can take a few seconds.",
  loading: true,
  autoClose: false,
});

await upload();

notifications.update(id, {
  title: "Upload complete",
  message: "report.pdf is ready to share.",
  color: "success",
  icon: <CheckIcon />,
  loading: false,
  autoClose: 3000,
});`;

const STATIC_SOURCE = `<Notification title="Changes saved">Your profile is up to date.</Notification>
<Notification title="Payment failed" color="danger" icon={<AlertIcon />}>
  Your card was declined.
</Notification>
<Notification loading withCloseButton={false} title="Syncing">
  Uploading 3 files…
</Notification>`;

function NotificationPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader to="/ui/notification" importLine={IMPORT} />
      <Notifications position={values.position} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={usageCode(values)}
      >
        <Button
          onClick={() =>
            notifications.show({
              title: values.title,
              message: values.message,
              color: values.color,
            })
          }
        >
          Show notification
        </Button>
      </Configurator>

      <Demo
        title="Loading, then update"
        description="Show a loading notification that stays, then update it in place by id when the work finishes. Its timer restarts on update."
        source={UPDATE_SOURCE}
      >
        <Button variant="default" onClick={showUpload}>
          Upload a file
        </Button>
      </Demo>

      <Demo
        title="Queue and pause"
        description="Up to five show at once and the rest wait. Hovering or focusing the stack pauses every timer, and so does switching tabs."
        source={
          'for (const step of steps) {\n  notifications.show({ title: step, message: "Queued" });\n}\n\nnotifications.clean();'
        }
      >
        <Button variant="light" onClick={showMany}>
          Show eight
        </Button>
        <Button variant="subtle" color="danger" onClick={notifications.clean}>
          Clear all
        </Button>
      </Demo>

      <Demo
        title="Notification component"
        description="The card itself, for inline use. Without an icon it shows a colour bar."
        source={STATIC_SOURCE}
      >
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Notification title="Changes saved">Your profile is up to date.</Notification>
          <Notification title="Payment failed" color="danger" icon={AlertIcon}>
            Your card was declined.
          </Notification>
          <Notification loading withCloseButton={false} title="Syncing">
            Uploading 3 files…
          </Notification>
        </div>
      </Demo>
    </div>
  );
}

function showUpload() {
  const id = notifications.show({
    title: "Uploading report.pdf",
    message: "This can take a few seconds.",
    loading: true,
    autoClose: false,
  });
  setTimeout(() => {
    notifications.update(id, {
      title: "Upload complete",
      message: "report.pdf is ready to share.",
      color: "success",
      icon: CheckIcon,
      loading: false,
      autoClose: 3000,
    });
  }, 2000);
}

const STEPS = ["Build", "Lint", "Typecheck", "Test", "Bundle", "Sign", "Upload", "Release"];

function showMany() {
  for (const [index, step] of STEPS.entries()) {
    notifications.show({ title: step, message: `Step ${index + 1} of ${STEPS.length}` });
  }
}
