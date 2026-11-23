// In @layer components so consumer utilities (Tailwind's @layer utilities, or
// any unlayered stylesheet) override it without specificity tricks. React
// inserts this at the top of <head>, before Tailwind's stylesheet, so the first
// line fixes Tailwind's layer order; otherwise "components" would be declared
// first, rank lowest, and preflight's button reset in "base" would win.
export const BUTTON_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-button {
    background-color: var(--hui-bg);
    color: var(--hui-fg);
    border: none;
    border-radius: var(--hui-radius);
    font-family: var(--hui-font);
    font-size: var(--hui-font-size);
    padding: var(--hui-py) var(--hui-px);
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      transform 160ms ease-out;
  }
  @media (hover: hover) and (pointer: fine) {
    .hui-button:hover:not(:disabled) {
      background-color: var(--hui-bg-hover);
      color: var(--hui-fg-hover);
    }
  }
  .hui-button:active:not(:disabled) {
    background-color: var(--hui-bg-active);
    transform: scale(0.97);
  }
  .hui-button:focus-visible {
    outline: 2px solid var(--hui-bg);
    outline-offset: 2px;
  }
  .hui-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-button {
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }
    .hui-button:active:not(:disabled) {
      transform: none;
    }
  }
}`;
