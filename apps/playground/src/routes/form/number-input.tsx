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
    prop: "currency",
    label: "Currency",
    options: ["none", "NGN", "USD", "EUR", "JPY"],
    defaultValue: "NGN",
  },
  {
    kind: "select",
    prop: "locale",
    label: "Locale",
    options: ["en-US", "en-NG", "de-DE", "fr-FR"],
    defaultValue: "en-US",
  },
  { kind: "switch", prop: "allowNegative", label: "Allow negative", defaultValue: true },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = {
  currency: "none",
  locale: "en-US",
  allowNegative: true,
  disabled: false,
};
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';

export const Route = createFileRoute("/form/number-input")({
  head: () => pageHead("/form/number-input"),
  ...searchOptionsFor(CONTROLS),
  component: NumberInputPage,
});

function NumberInputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { amount: null as number | null } });
  const { currency, ...props } = values;
  const currencyProp = currency === "none" ? undefined : currency;

  return (
    <div>
      <PageHeader to="/form/number-input" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          `<form.AppField name="amount">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Amount</FormField.Label>\n        ${toJsx("field.NumberInput", values, COMPONENT_DEFAULTS)}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        <form.AppField name="amount">
          {(field) => (
            <FormField className="flex w-full max-w-xs flex-col gap-1">
              <FormField.Label className="text-sm font-medium">Amount</FormField.Label>
              <div className="flex items-center gap-2">
                <field.NumberInput
                  {...props}
                  currency={currencyProp}
                  className="rounded-md border border-line px-3 py-2 text-sm"
                />
              </div>
              <FormField.Description className="text-xs text-fg-muted">
                Value: <span>{String(field.state.value)}</span>
              </FormField.Description>
              <FormField.Error className="text-xs text-red-600" />
            </FormField>
          )}
        </form.AppField>
      </Configurator>

      <Demo
        title="Validation on a number"
        description="The field value is a number, or null while empty, so validators compare numbers directly."
        source={`useAppForm({\n  defaultValues: { amount: null as number | null },\n  validators: {\n    onChange: ({ value }) =>\n      value.amount !== null && value.amount < 100\n        ? { fields: { amount: "Minimum is 100" } }\n        : undefined,\n  },\n});`}
      >
        <MinimumDemo />
      </Demo>
    </div>
  );
}

function MinimumDemo() {
  const form = useAppForm({
    defaultValues: { amount: null as number | null },
    validators: {
      onChange: ({ value }) =>
        value.amount !== null && value.amount < 100
          ? { fields: { amount: "Minimum is 100" } }
          : undefined,
    },
  });

  return (
    <form.AppField name="amount">
      {(field) => (
        <FormField className="flex w-full max-w-xs flex-col gap-1">
          <FormField.Label className="text-sm font-medium">Top-up</FormField.Label>
          <field.NumberInput
            currency="USD"
            className="rounded-md border border-line px-3 py-2 text-sm aria-invalid:border-red-500"
          />
          <FormField.Error className="text-xs text-red-600" />
        </FormField>
      )}
    </form.AppField>
  );
}
