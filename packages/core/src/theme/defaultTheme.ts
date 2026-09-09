import type { AppTheme } from "./types";

export const DEFAULT_THEME: Readonly<AppTheme> = Object.freeze({
  colors: Object.freeze({
    primary: "#2563eb",
    secondary: "#64748b",
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#f59e0b",
  }),

  radius: Object.freeze({
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
  }),

  spacing: Object.freeze({
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "36px",
  }),
  fontFamily: "Inter, sans-serif",
});
