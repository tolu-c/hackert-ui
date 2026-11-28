import { FormField, useAppForm } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { isValidPhoneNumber } from "libphonenumber-js";
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
    prop: "defaultCountry",
    label: "Default country",
    options: ["US", "NG", "GB", "DE", "IN", "BR"],
    defaultValue: "US",
  },
  {
    kind: "select",
    prop: "locale",
    label: "Country names",
    options: ["en", "fr", "de", "ja"],
    defaultValue: "en",
  },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = { defaultCountry: "US", locale: "en", disabled: false };
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';

export const Route = createFileRoute("/form/phone-input")({
  head: () => pageHead("/form/phone-input"),
  ...searchOptionsFor(CONTROLS),
  component: PhoneInputPage,
});

const VALIDATION_SOURCE = `import { isValidPhoneNumber } from "libphonenumber-js";

useAppForm({
  defaultValues: { phone: "" },
  validators: {
    onChange: ({ value }) =>
      isValidPhoneNumber(value.phone)
        ? undefined
        : { fields: { phone: "Enter a valid phone number" } },
  },
});`;

function PhoneInputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { phone: "" } });

  return (
    <div>
      <PageHeader to="/form/phone-input" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(
          IMPORT,
          `<form.AppField name="phone">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Phone</FormField.Label>\n        ${toJsx("field.PhoneInput", values, COMPONENT_DEFAULTS)}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        <form.AppField name="phone">
          {(field) => (
            <FormField className="w-full max-w-xs">
              <FormField.Label>Phone</FormField.Label>
              {/* Remount on a new default country: it only seeds the initial state. */}
              <field.PhoneInput key={values.defaultCountry} {...values} />
              <FormField.Description>
                Value: <span>{JSON.stringify(field.state.value)}</span>
              </FormField.Description>
              <FormField.Error />
            </FormField>
          )}
        </form.AppField>
      </Configurator>

      <Demo
        title="Validation"
        description="The value is E.164, so libphonenumber-js's isValidPhoneNumber can check it. An invalid field turns its label, border and message red."
        source={VALIDATION_SOURCE}
      >
        <ValidationDemo />
      </Demo>

      <Demo
        title="A short list of countries"
        description="countries limits the picker. A stored value fills in its country and national format."
        source={
          '<field.PhoneInput\n  defaultCountry="GB"\n  countries={["GB", "IE", "FR", "DE", "NL"]}\n/>\n\n// defaultValues: { phone: "+442079460000" }'
        }
      >
        <ShortListDemo />
      </Demo>
    </div>
  );
}

function ValidationDemo() {
  const form = useAppForm({
    defaultValues: { phone: "" },
    validators: {
      onChange: ({ value }) =>
        isValidPhoneNumber(value.phone)
          ? undefined
          : { fields: { phone: "Enter a valid phone number" } },
    },
  });

  return (
    <form.AppField name="phone">
      {(field) => (
        <FormField className="w-full max-w-xs">
          <FormField.Label>Mobile number</FormField.Label>
          <field.PhoneInput defaultCountry="NG" />
          <FormField.Description>We text a code to this number.</FormField.Description>
          <FormField.Error />
        </FormField>
      )}
    </form.AppField>
  );
}

function ShortListDemo() {
  const form = useAppForm({ defaultValues: { phone: "+442079460000" } });

  return (
    <form.AppField name="phone">
      {(field) => (
        <FormField className="w-full max-w-xs">
          <FormField.Label>Office line</FormField.Label>
          <field.PhoneInput defaultCountry="GB" countries={["GB", "IE", "FR", "DE", "NL"]} />
        </FormField>
      )}
    </form.AppField>
  );
}
