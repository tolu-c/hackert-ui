import { FormField, Select, type SelectData, useAppForm } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/catalog";
import { CodeBlock } from "@/components/CodeBlock";
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
    prop: "mode",
    label: "Mode",
    options: ["select", "searchable", "autocomplete"],
    defaultValue: "select",
  },
  { kind: "text", prop: "placeholder", label: "Placeholder", defaultValue: "Pick a country" },
  { kind: "switch", prop: "withCheckIcon", label: "Check icon", defaultValue: true },
  {
    kind: "select",
    prop: "checkIconPosition",
    label: "Check icon position",
    options: ["left", "right"],
    defaultValue: "left",
  },
  { kind: "switch", prop: "withAlignedLabels", label: "Aligned labels", defaultValue: false },
  {
    kind: "text",
    prop: "nothingFoundMessage",
    label: "Nothing found message",
    defaultValue: "Nothing found...",
  },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

const COMPONENT_DEFAULTS = {
  mode: "select",
  placeholder: "",
  withCheckIcon: true,
  checkIconPosition: "left",
  withAlignedLabels: false,
  nothingFoundMessage: "",
  disabled: false,
};
const IMPORT = 'import { FormField, useAppForm } from "@hackert-ui/form";';
const SELECT_IMPORT = 'import { Select } from "@hackert-ui/form";';

const COUNTRIES = [
  { value: "ng", label: "Nigeria" },
  { value: "gh", label: "Ghana" },
  { value: "ke", label: "Kenya" },
  { value: "za", label: "South Africa" },
  { value: "cw", label: "Curaçao", disabled: true },
  { value: "fr", label: "France" },
  { value: "ca", label: "Canada" },
];

const LIBRARIES = ["React", "Angular", "Vue", "Svelte"];

const OPTION_TYPES = `type SelectPrimitive = string | number | boolean;

// One option: a bare value (labelled by itself) or an object.
type SelectOptionInput<TValue extends SelectPrimitive = string> =
  | TValue
  | { value: TValue; label?: string; disabled?: boolean };

interface SelectGroup<TValue extends SelectPrimitive = string> {
  group: string;
  items: SelectOptionInput<TValue>[];
}

// What \`options\` accepts: options and groups, mixed freely.
type SelectData<TValue extends SelectPrimitive = string> = (
  | SelectOptionInput<TValue>
  | SelectGroup<TValue>
)[];`;

export const Route = createFileRoute("/form/select-input")({
  head: () => pageHead("/form/select-input"),
  ...searchOptionsFor(CONTROLS),
  component: SelectInputPage,
});

function SelectInputPage() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const form = useAppForm({ defaultValues: { country: null as string | null } });
  const { mode, placeholder, nothingFoundMessage, ...props } = values;

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
          `<form.AppField name="country">\n    {(field) => (\n      <FormField>\n        <FormField.Label>Country</FormField.Label>\n        ${toJsx("field.SelectInput", { ...values, options: "COUNTRIES" }, COMPONENT_DEFAULTS).replace('options="COUNTRIES"', "options={COUNTRIES}")}\n        <FormField.Error />\n      </FormField>\n    )}\n  </form.AppField>`,
        )}
      >
        {/* Remount per mode: the three modes keep different text state. */}
        <form.AppField key={mode} name="country">
          {(field) => (
            <FormField className="w-full max-w-xs">
              <FormField.Label>Country</FormField.Label>
              <field.SelectInput
                {...props}
                mode={mode}
                placeholder={placeholder || undefined}
                nothingFoundMessage={nothingFoundMessage || undefined}
                options={COUNTRIES}
              />
              <FormField.Description>
                Value: {JSON.stringify(field.state.value)}
              </FormField.Description>
              <FormField.Error />
            </FormField>
          )}
        </form.AppField>
      </Configurator>

      <Demo
        title="Searchable"
        description="mode=searchable lets people filter the options by typing. The value must still be one of the options."
        source={`${SELECT_IMPORT}\n\n<Select\n  mode="searchable"\n  placeholder="Pick value"\n  options={["React", "Angular", "Vue", "Svelte"]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <LibrarySelect mode="searchable" />
      </Demo>

      <Demo
        title="Nothing found"
        description="Set nothingFoundMessage to show a message when no option matches. Without it, the dropdown hides instead."
        source={`<Select\n  mode="searchable"\n  options={["React", "Angular", "Vue", "Svelte"]}\n  nothingFoundMessage="Nothing found..."\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <LibrarySelect mode="searchable" nothingFoundMessage="Nothing found..." />
      </Demo>

      <Demo
        title="Checked option"
        description="The chosen option shows a check. Move it with checkIconPosition, remove it with withCheckIcon={false}, or reserve its space on every option with withAlignedLabels."
        source={`<Select\n  checkIconPosition="right"\n  options={["React", "Angular", "Vue", "Svelte"]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <LibrarySelect initial="React" checkIconPosition="right" />
      </Demo>

      <Demo
        title="Value type"
        description="Values can be strings, numbers or booleans. Select infers the type from options, or you can pass it explicitly. onChange hands the value back in that type, never as a string."
        source={`${SELECT_IMPORT}\n\nconst [limit, setLimit] = useState<number | null>(25);\n\n<Select<number>\n  options={[10, 25, 50, 100]}\n  value={limit}\n  onChange={setLimit}\n/>`}
      >
        <PageSizeSelect />
      </Demo>

      <Demo
        title="Data formats: primitives"
        description="An array of strings, numbers or booleans. Each value is also its label."
        source={'<Select options={["React", "Angular"]} value={value} onChange={setValue} />'}
      >
        <DataSelect options={["React", "Angular"]} />
      </Demo>

      <Demo
        title="Data formats: objects"
        description="Objects with value, an optional label (it defaults to the value) and an optional disabled flag."
        source={`<Select\n  options={[\n    { value: "react", label: "React" },\n    { value: "ng", label: "Angular" },\n    { value: "vue", label: "Vue", disabled: true },\n  ]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <DataSelect
          options={[
            { value: "react", label: "React" },
            { value: "ng", label: "Angular" },
            { value: "vue", label: "Vue", disabled: true },
          ]}
        />
      </Demo>

      <Demo
        title="Data formats: groups of primitives"
        description="Groups render under their label and are filtered as a whole when searching."
        source={`<Select\n  options={[\n    { group: "Frontend", items: ["React", "Angular"] },\n    { group: "Backend", items: ["Express", "Django"] },\n  ]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <DataSelect
          mode="searchable"
          options={[
            { group: "Frontend", items: ["React", "Angular"] },
            { group: "Backend", items: ["Express", "Django"] },
          ]}
        />
      </Demo>

      <Demo
        title="Data formats: groups of objects"
        description="Group items can be objects too, and loose options and groups can be mixed."
        source={`<Select\n  options={[\n    { group: "Frontend", items: [{ value: "react", label: "React" }, { value: "ng", label: "Angular" }] },\n    { group: "Backend", items: [{ value: "express", label: "Express" }, { value: "django", label: "Django" }] },\n  ]}\n  value={value}\n  onChange={setValue}\n/>`}
      >
        <DataSelect
          options={[
            {
              group: "Frontend",
              items: [
                { value: "react", label: "React" },
                { value: "ng", label: "Angular" },
              ],
            },
            {
              group: "Backend",
              items: [
                { value: "express", label: "Express" },
                { value: "django", label: "Django" },
              ],
            },
          ]}
        />
      </Demo>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Option types</h2>
        <p className="mt-1 text-sm text-fg-muted">
          The types behind <code>options</code>, all exported from @hackert-ui/form.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <CodeBlock code={OPTION_TYPES} />
        </div>
      </section>
    </div>
  );
}

interface LibrarySelectProps {
  readonly mode?: "select" | "searchable";
  readonly initial?: string;
  readonly nothingFoundMessage?: string;
  readonly checkIconPosition?: "left" | "right";
}

function LibrarySelect({ initial, ...props }: LibrarySelectProps) {
  const [value, setValue] = useState<string | null>(initial ?? null);

  return (
    <div className="w-full max-w-xs">
      <Select
        {...props}
        aria-label="Your favorite library"
        placeholder="Pick value"
        options={LIBRARIES}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

function PageSizeSelect() {
  const [limit, setLimit] = useState<number | null>(25);

  return (
    <div className="w-full max-w-xs">
      <Select<number>
        aria-label="Rows per page"
        options={[10, 25, 50, 100]}
        value={limit}
        onChange={setLimit}
      />
      <p className="mt-2 text-xs text-fg-muted">
        Value: {JSON.stringify(limit)} ({typeof limit})
      </p>
    </div>
  );
}

function DataSelect({
  options,
  mode,
}: {
  readonly options: SelectData;
  readonly mode?: "select" | "searchable";
}) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xs">
      <Select
        mode={mode}
        aria-label="Library"
        placeholder="Pick value"
        options={options}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
