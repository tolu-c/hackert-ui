import { Link, Outlet } from "@tanstack/react-router";
import type { CatalogSection } from "@/catalog";

interface SectionLayoutProps {
  readonly section: CatalogSection;
}

export function SectionLayout({ section }: SectionLayoutProps) {
  return (
    <div className="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
      <nav aria-label={`${section.label} components`} className="mb-8 md:mb-0">
        <p className="mb-2 hidden text-xs font-semibold tracking-wide text-fg-muted uppercase md:block">
          {section.label}
        </p>
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 md:sticky md:top-24 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {section.items.map((item) => (
            <li key={item.to} className="shrink-0">
              <Link
                to={item.to}
                className="block rounded-md px-3 py-1.5 text-sm transition-colors duration-150"
                inactiveProps={{
                  className: "text-fg-secondary hover:bg-subtle hover:text-fg",
                }}
                activeProps={{
                  className:
                    "bg-blue-50 dark:bg-blue-500/15 font-medium text-blue-700 dark:text-blue-300",
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
