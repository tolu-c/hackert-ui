import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ModalProps extends ComponentPropsWithoutRef<"div"> {
  readonly children?: ReactNode;
}

export function Modal({ children, ...divProps }: ModalProps) {
  return <div {...divProps}>{children}</div>;
}
