import { useDisclosure, useModalsStack } from "@hackert-ui/hooks";
import { Button, Modal, type ModalSize } from "@hackert-ui/ui";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx } from "@/configurator/to-jsx";

const SIZES = ["xs", "sm", "md", "lg", "xl", "auto", "50%", "70%", "100%"] as const;

const CONTROLS = defineControls([
  { kind: "select", prop: "size", label: "Size", options: SIZES, defaultValue: "lg" },
  { kind: "switch", prop: "centered", label: "Centered", defaultValue: false },
  { kind: "switch", prop: "withCloseButton", label: "Close button", defaultValue: true },
  { kind: "text", prop: "title", label: "Title", defaultValue: "Delete this page?" },
  {
    kind: "text",
    prop: "description",
    label: "Description",
    defaultValue: "This action cannot be undone.",
  },
]);

const COMPONENT_DEFAULTS = { size: "lg", centered: false, withCloseButton: true };
const IMPORT = 'import { Modal } from "@hackert-ui/ui";';
const HOOKS_IMPORT = 'import { useDisclosure } from "@hackert-ui/hooks";';

export const Route = createFileRoute("/ui/modal")({
  head: () => pageHead("/ui/modal"),
  ...searchOptionsFor(CONTROLS),
  component: ModalPage,
});

function usageCode(props: Readonly<Record<string, string | boolean>>) {
  const opening = toJsx("Modal", props, COMPONENT_DEFAULTS).replace(
    "<Modal",
    "<Modal opened={opened} onClose={close}",
  );
  return `${IMPORT}
${HOOKS_IMPORT}

function Demo() {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      ${opening.replace(" />", ">")}
        Are you sure you want to delete this page?
      </Modal>
      <Button onClick={open}>Open modal</Button>
    </>
  );
}`;
}

const SCROLL_SOURCE = `<Modal opened={opened} onClose={close} title="Terms of service">
  {paragraphs.map((text) => <p key={text}>{text}</p>)}
</Modal>`;

const COMPOUND_SOURCE = `<Modal.Root opened={opened} onClose={close} size="md">
  <Modal.Header className="border-b border-line pb-4">
    <Modal.Title>Invite people</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body className="pt-4">…</Modal.Body>
</Modal.Root>`;

const STACK_SOURCE = `const stack = useModalsStack(["delete-page", "confirm-action"]);

<Modal.Stack>
  <Modal {...stack.register("delete-page")} title="Delete this page?">
    Are you sure? This action cannot be undone.
    <Button variant="default" onClick={stack.closeAll}>Cancel</Button>
    <Button color="danger" onClick={() => stack.open("confirm-action")}>Delete</Button>
  </Modal>
  <Modal {...stack.register("confirm-action")} title="Confirm action">
    Press confirm to delete the page for good.
    <Button variant="default" onClick={stack.closeAll}>Cancel</Button>
    <Button color="danger" onClick={stack.closeAll}>Confirm</Button>
  </Modal>
</Modal.Stack>

<Button variant="default" onClick={() => stack.open("delete-page")}>Open modal</Button>`;

const BACKDROP_SOURCE = `<Modal
  opened={opened}
  onClose={close}
  title="Blurred backdrop"
  className="backdrop:backdrop-blur-sm"
>
  The ::backdrop takes Tailwind's backdrop: variant.
</Modal>`;

const PARAGRAPHS = Array.from(
  { length: 14 },
  (_, index) =>
    `${index + 1}. These terms govern your use of the service. Only this body scrolls: the title and close button stay put, and the page behind the modal does not move.`,
);

function ModalPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader to="/ui/modal" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={usageCode(values)}
      >
        <UsageDemo {...values} />
      </Configurator>

      <Demo
        title="Scrollable content"
        description="Long content scrolls inside the body. The header stays fixed, and the page behind is locked."
        source={SCROLL_SOURCE}
      >
        <ScrollDemo />
      </Demo>

      <Demo
        title="Compound components"
        description="Modal.Root, Header, Title, Description, CloseButton and Body give full control over the layout. <Modal> is built from them."
        source={COMPOUND_SOURCE}
      >
        <CompoundDemo />
      </Demo>

      <Demo
        title="Modal.Stack"
        description="useModalsStack from @hackert-ui/hooks drives a group of modals. Only the latest is shown, over a single backdrop; closing it returns to the one beneath."
        source={STACK_SOURCE}
      >
        <StackDemo />
      </Demo>

      <Demo
        title="Custom backdrop"
        description="Style the backdrop with Tailwind's backdrop: variant on className."
        source={BACKDROP_SOURCE}
      >
        <BackdropDemo />
      </Demo>
    </div>
  );
}

interface UsageDemoProps {
  readonly size: ModalSize;
  readonly centered: boolean;
  readonly withCloseButton: boolean;
  readonly title: string;
  readonly description: string;
}

function UsageDemo({ title, description, ...props }: UsageDemoProps) {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <Modal
        {...props}
        opened={opened}
        onClose={close}
        title={title || undefined}
        description={description || undefined}
        aria-label={title ? undefined : "Example modal"}
      >
        <p>Are you sure you want to delete this page?</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="danger" onClick={close}>
            Delete
          </Button>
        </div>
      </Modal>
      <Button onClick={open}>Open modal</Button>
    </>
  );
}

function ScrollDemo() {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <Modal opened={opened} onClose={close} title="Terms of service" size="md">
        <div className="flex flex-col gap-3">
          {PARAGRAPHS.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </Modal>
      <Button variant="default" onClick={open}>
        Read the terms
      </Button>
    </>
  );
}

function CompoundDemo() {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <Modal.Root opened={opened} onClose={close} size="md">
        <Modal.Header className="border-b border-line pb-4">
          <Modal.Title>Invite people</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body className="pt-4">
          <p>Teammates you invite can view and edit every page in this workspace.</p>
          <div className="mt-6 flex justify-end">
            <Button onClick={close}>Send invites</Button>
          </div>
        </Modal.Body>
      </Modal.Root>
      <Button variant="light" onClick={open}>
        Invite people
      </Button>
    </>
  );
}

function StackDemo() {
  const stack = useModalsStack(["delete-page", "confirm-action", "really-confirm-action"]);

  return (
    <>
      <Modal.Stack>
        <Modal {...stack.register("delete-page")} title="Delete this page?" size="sm">
          Are you sure you want to delete this page? This action cannot be undone.
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="default" onClick={stack.closeAll}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => stack.open("confirm-action")}>
              Delete
            </Button>
          </div>
        </Modal>
        <Modal {...stack.register("confirm-action")} title="Confirm action" size="sm">
          Are you sure you want to perform this action? If you are sure, press confirm below.
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="default" onClick={stack.closeAll}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => stack.open("really-confirm-action")}>
              Confirm
            </Button>
          </div>
        </Modal>
        <Modal {...stack.register("really-confirm-action")} title="Really confirm action" size="sm">
          This is your last chance to cancel. After you press confirm, the action is performed and
          cannot be undone.
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="default" onClick={stack.closeAll}>
              Cancel
            </Button>
            <Button color="danger" onClick={stack.closeAll}>
              Confirm
            </Button>
          </div>
        </Modal>
      </Modal.Stack>
      <Button variant="default" onClick={() => stack.open("delete-page")}>
        Open modal
      </Button>
    </>
  );
}

function BackdropDemo() {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Blurred backdrop"
        size="sm"
        centered
        className="backdrop:backdrop-blur-sm"
      >
        The ::backdrop takes Tailwind&apos;s backdrop: variant.
      </Modal>
      <Button variant="subtle" onClick={open}>
        Open blurred
      </Button>
    </>
  );
}
