import { createFileRoute } from "@tanstack/react-router";
import { SECTIONS } from "#/catalog";
import { SectionLayout } from "#/components/SectionLayout";

export const Route = createFileRoute("/hooks")({ component: HooksLayout });

function HooksLayout() {
  return <SectionLayout section={SECTIONS.hooks} />;
}
