import { createFileRoute } from "@tanstack/react-router";
import { SECTIONS } from "@/catalog";
import { SectionLayout } from "@/components/SectionLayout";

export const Route = createFileRoute("/ui")({ component: UiLayout });

function UiLayout() {
  return <SectionLayout section={SECTIONS.ui} />;
}
