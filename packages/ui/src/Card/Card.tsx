import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  readonly children: ReactNode;
}

export function Card({ children, ...divProps }: CardProps) {
  return <div {...divProps}>{children}</div>;
}
