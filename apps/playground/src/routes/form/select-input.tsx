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
    prop: "mode",
    label: "Mode",
    options: ["select", "searchable", "autocomplete"],
    defaultValue: "searchable",
  },
  { kind: "text", prop: "placeholder", label: "Placeholder", defaultValue: "Pick a country" },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { mode: "select", placeholder: "", disabled: false };
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';

const OPTIONS = [
  { value: "ng", label: "Nigeria" },
  { value: "gh", label: "Ghana" },
  { value: "ke", label: "Kenya" },
  { value: "za", label: "South Africa" },
  { value: "cw", label: "Curaçao", disabled: true },
  { value: "fr", label: "France" },
  { value: "ca", label: "Canada" },
];

export const Route = createFileRoute("/form/select-input")({
  head: () => pageHead("/form/select-input"),
  ...searchOptionsFor(CONTROLS),
  component: SelectInputPage,
});

function SelectInputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { country: "" } });
  const { mode, placeholder, disabled } = values;

  return (
    <div>
      <PageHeader to="/form/select-input" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          `<form.AppField name="country">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Country</FormField.Label>\n        ${toJsx("field.SelectInput", { ...values, options: "OPTIONS" }, COMPONENT_DEFAULTS).replace('options="OPTIONS"', "options={OPTIONS}")}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        {/* Remount per mode: the three modes keep different text state. */}
        <form.AppField key={mode} name="country">
          {(field) => (
            <FormField className="flex w-full max-w-xs flex-col gap-1">
              <FormField.Label className="text-sm font-medium">Country</FormField.Label>
              <field.SelectInput
                mode={mode}
                placeholder={placeholder || undefined}
                options={OPTIONS}
                disabled={disabled}
                className="rounded-md border border-line px-3 py-2 text-sm"
              />
              <FormField.Description className="text-xs text-fg-muted">
                Value: {JSON.stringify(field.state.value)}
              </FormField.Description>
              <FormField.Error className="text-xs text-red-600" />
            </FormField>
          )}
        </form.AppField>
      </Configurator>
    </div>
  );
}
