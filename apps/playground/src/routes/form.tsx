import { Input } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "#/components/Demo";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/form")({ component: FormRoute });

function FormRoute() {
  return (
    <div>
      <PageHeader
        title="Form"
        packageName="@hackert-ui/form"
        description="Form controls. Input generates an id with useId and points its label at it, so clicking the label focuses the field."
      />

      <Demo
        title="Input"
        description="Label and input are associated automatically."
        source={`import { Input } from "@hackert-ui/form";\n\n<Input label="Email" type="email" placeholder="you@example.com" />`}
      >
        <Input label="Email" type="email" placeholder="you@example.com" />
      </Demo>

      <Demo
        title="Input without a label"
        description="The label is optional; the input still renders."
        source={`<Input placeholder="Search" />`}
      >
        <Input placeholder="Search" />
      </Demo>
    </div>
  );
}
