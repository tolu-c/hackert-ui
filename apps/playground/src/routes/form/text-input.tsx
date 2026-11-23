import { FormField, useAppForm } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
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
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { type: "text", placeholder: "", disabled: false };
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
            <FormField className="flex w-full max-w-xs flex-col gap-1">
              <FormField.Label className="text-sm font-medium">Email</FormField.Label>
              <field.TextInput
                {...values}
                placeholder={values.placeholder || undefined}
                className="rounded-md border border-line px-3 py-2 text-sm"
              />
              <FormField.Error className="text-xs text-red-600" />
            </FormField>
          )}
        </form.AppField>
      </Configurator>
    </div>
  );
}
