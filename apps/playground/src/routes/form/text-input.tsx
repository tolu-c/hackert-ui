import { FormField, useAppForm } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
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
    kind: "select",
    prop: "type",
    label: "Type",
    options: ["text", "email", "password", "tel", "url", "search"],
    defaultValue: "email",
  },
  { kind: "text", prop: "placeholder", label: "Placeholder", defaultValue: "you@example.com" },
  { kind: "switch", prop: "visibilityToggle", label: "Visibility toggle", defaultValue: true },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = {
  type: "text",
  placeholder: "",
  visibilityToggle: true,
  disabled: false,
};
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';

export const Route = createFileRoute("/form/text-input")({
  head: () => pageHead("/form/text-input"),
  ...searchOptionsFor(CONTROLS),
  component: TextInputPage,
});

function TextInputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { email: "" } });

  return (
    <div>
      <PageHeader to="/form/text-input" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          `<form.AppField name="email">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Email</FormField.Label>\n        ${toJsx("field.TextInput", values, COMPONENT_DEFAULTS)}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        <form.AppField name="email">
          {(field) => (
            <FormField className="w-full max-w-xs">
              <FormField.Label>Email</FormField.Label>
              <field.TextInput {...values} placeholder={values.placeholder || undefined} />
              <FormField.Error />
            </FormField>
          )}
        </form.AppField>
      </Configurator>

      <Demo
        title="Password"
        description="type=password adds a button that reveals the password. It keeps focus in the input and announces itself as Show password / Hide password."
        source={'<field.TextInput type="password" autoComplete="current-password" />'}
      >
        <PasswordDemo />
      </Demo>

      <Demo
        title="Without the toggle"
        description="Set visibilityToggle={false} to hide the button. Pass visibilityToggleLabels to translate it."
        source={'<field.TextInput type="password" visibilityToggle={false} />'}
      >
        <PasswordDemo visibilityToggle={false} />
      </Demo>
    </div>
  );
}

function PasswordDemo({ visibilityToggle = true }: { readonly visibilityToggle?: boolean }) {
  const form = useAppForm({ defaultValues: { password: "correct horse" } });

  return (
    <form.AppField name="password">
      {(field) => (
        <FormField className="w-full max-w-xs">
          <FormField.Label>Password</FormField.Label>
          <field.TextInput
            type="password"
            autoComplete="current-password"
            visibilityToggle={visibilityToggle}
          />
        </FormField>
      )}
    </form.AppField>
  );
}
