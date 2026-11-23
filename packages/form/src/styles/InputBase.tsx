import type { ReactNode } from "react";

import { FormStyles, useFormThemeVars } from "./theme-vars";

export interface InputSections {
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
  // CSS widths for text sections such as a currency code; icons fit the 34px default.
  readonly leftSectionWidth?: string | undefined;
  readonly rightSectionWidth?: string | undefined;
}

interface InputBaseProps extends InputSections {
  readonly children: ReactNode;
  readonly dataState?: string | undefined;
}

// The themed wrapper every control renders: stylesheet, theme variables and side sections.
export function InputBase({
  leftSection,
  rightSection,
  leftSectionWidth,
  rightSectionWidth,
  children,
  dataState,
}: InputBaseProps) {
  const vars = useFormThemeVars();
  const hasLeft = leftSection !== undefined && leftSection !== null;
  const hasRight = rightSection !== undefined && rightSection !== null;

  return (
    <div
      className="hui-input-wrapper hui-themed"
      style={{
        ...vars,
        ...(leftSectionWidth ? { "--hui-left-section-width": leftSectionWidth } : {}),
        ...(rightSectionWidth ? { "--hui-right-section-width": rightSectionWidth } : {}),
      }}
      data-left-section={hasLeft ? "" : undefined}
      data-right-section={hasRight ? "" : undefined}
      data-state={dataState}
    >
      <FormStyles />
      {hasLeft ? (
        <span className="hui-input-section" data-position="left">
          {leftSection}
        </span>
      ) : null}
      {children}
      {hasRight ? (
        <span className="hui-input-section" data-position="right">
          {rightSection}
        </span>
      ) : null}
    </div>
  );
}
