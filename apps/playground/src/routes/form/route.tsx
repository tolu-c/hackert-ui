import { createFileRoute } from "@tanstack/react-router";
import { SECTIONS } from "@/catalog";
import { SectionLayout } from "@/components/SectionLayout";

export const Route = createFileRoute("/form")({ component: FormLayout });

function FormLayout() {
  return <SectionLayout section={SECTIONS.form} />;
}
