import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  readonly children: ReactNode;
}

export function Button({
  type = "button",
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button type={type} className="px-2 py-1" {...buttonProps}>
      {children}
    </button>
  );
}
