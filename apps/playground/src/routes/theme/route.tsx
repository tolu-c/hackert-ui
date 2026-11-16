import { createFileRoute } from "@tanstack/react-router";
import { SECTIONS } from "#/catalog";
import { SectionLayout } from "#/components/SectionLayout";

export const Route = createFileRoute("/theme")({ component: ThemeLayout });

function ThemeLayout() {
  return <SectionLayout section={SECTIONS.theme} />;
}
