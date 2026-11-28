// In @layer components so consumer utilities (Tailwind's @layer utilities, or
// any unlayered stylesheet) override it without specificity tricks. React
// inserts this at the top of <head>, before Tailwind's stylesheet, so the first
// line fixes Tailwind's layer order; otherwise "components" would be declared
// first, rank lowest, and preflight's button reset in "base" would win.
// Every variant draws a 1px border (transparent when unused), so all variants
// of a size share one box and can sit side by side.
export const BUTTON_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: var(--hui-bg);
    color: var(--hui-fg);
    border: 1px solid var(--hui-bd);
    border-radius: var(--hui-radius);
    font-family: var(--hui-font);
    font-size: var(--hui-font-size);
    font-weight: 500;
    line-height: 1.25;
    padding: calc(var(--hui-py) - 1px) calc(var(--hui-px) - 1px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease,
      transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  .hui-button[data-full-width] {
    width: 100%;
  }
  .hui-button-inner {
    display: flex;
    flex: 1;
    gap: 0.5em;
    align-items: center;
    justify-content: center;
    min-width: 0;
    transition:
      opacity 150ms ease,
      filter 150ms ease;
  }
  .hui-button[data-justify="space-between"] > .hui-button-inner {
    justify-content: space-between;
  }
  .hui-button-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hui-button-section {
    display: inline-flex;
    flex: none;
    align-items: center;
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
    outline: 2px solid var(--hui-ring);
    outline-offset: 2px;
  }
  .hui-button:disabled:not([data-loading]) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  /* Loading keeps the button's colours: it is busy, not unavailable. The label
     stays in the layout, so the width holds while the spinner covers it. */
  .hui-button[data-loading] {
    cursor: progress;
  }
  .hui-button[data-loading] > .hui-button-inner {
    opacity: 0;
    filter: blur(2px);
  }
  .hui-button-loader {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity 150ms ease,
      scale 150ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  @starting-style {
    .hui-button-loader {
      opacity: 0;
      scale: 0.8;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-button {
      transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease;
    }
    .hui-button:active:not(:disabled) {
      transform: none;
    }
    .hui-button[data-loading] > .hui-button-inner {
      filter: none;
    }
    @starting-style {
      .hui-button-loader {
        scale: 1;
      }
    }
  }
}`;
