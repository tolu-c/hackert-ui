import type { ReactNode } from "react";

interface FieldLabelProps {
  readonly htmlFor?: string | undefined;
  readonly children: ReactNode;
  readonly aside?: ReactNode;
}

export function FieldLabel({ htmlFor, children, aside }: FieldLabelProps) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {children}
      </label>
      {aside}
    </div>
  );
}
