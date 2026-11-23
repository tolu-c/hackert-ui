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
  { kind: "text", prop: "placeholder", label: "Placeholder", defaultValue: "Tell us more" },
  { kind: "slider", prop: "rows", label: "Rows", options: ["2", "3", "5", "8"], defaultValue: "3" },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { placeholder: "", rows: "3", disabled: false };
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';

export const Route = createFileRoute("/form/text-area")({
  head: () => pageHead("/form/text-area"),
  ...searchOptionsFor(CONTROLS),
  component: TextAreaPage,
});

function TextAreaPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { message: "" } });
  const { rows, ...props } = values;

  return (
    <div>
      <PageHeader to="/form/text-area" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          `<form.AppField name="message">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Message</FormField.Label>\n        ${toJsx("field.TextArea", values, COMPONENT_DEFAULTS)}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        <form.AppField name="message">
          {(field) => (
            <FormField className="w-full max-w-xs">
              <FormField.Label>Message</FormField.Label>
              <field.TextArea
                {...props}
                rows={Number(rows)}
                placeholder={props.placeholder || undefined}
              />
              <FormField.Error />
            </FormField>
          )}
        </form.AppField>
      </Configurator>
    </div>
  );
}
