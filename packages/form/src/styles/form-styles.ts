// In @layer components so consumer utilities (Tailwind's @layer utilities, or any
// unlayered stylesheet) override it. The first line fixes the layer order, as in
// @hackert-ui/ui's Button, so preflight's resets in "base" cannot win.
// Neutral colours are fixed light-dark() pairs: the theme has no neutral tokens.
export const FORM_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-themed {
    --hui-text: light-dark(#18181b, #f4f4f5);
    --hui-muted: light-dark(#71717a, #a1a1aa);
    --hui-placeholder: light-dark(#a1a1aa, #71717a);
    --hui-border: light-dark(#d4d4d8, #3f3f46);
    --hui-surface: light-dark(#ffffff, #18181b);
    --hui-surface-muted: light-dark(#f4f4f5, #27272a);
    --hui-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    font-family: var(--hui-font);
  }
  .hui-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hui-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--hui-text);
    transition: color 150ms ease;
  }
  .hui-description {
    margin: 0;
    font-size: 12px;
    color: var(--hui-muted);
  }
  .hui-error {
    margin: 0;
    font-size: 12px;
    color: var(--hui-danger);
  }
  .hui-field[data-invalid] > .hui-label,
  .hui-field[data-invalid] > .hui-description {
    color: var(--hui-danger);
  }
  .hui-field > .hui-error:empty {
    margin-top: -4px;
  }
  .hui-input-wrapper {
    position: relative;
    display: block;
    width: 100%;
  }
  .hui-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 36px;
    margin: 0;
    padding-block: 0;
    padding-inline: 12px;
    font: inherit;
    font-size: 14px;
    line-height: 1.4;
    color: var(--hui-text);
    background: var(--hui-surface);
    border: 1px solid var(--hui-border);
    border-radius: var(--hui-radius);
    outline: none;
    appearance: none;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease;
  }
  textarea.hui-input {
    min-height: 72px;
    padding-block: 8px;
    resize: vertical;
  }
  .hui-input::placeholder {
    color: var(--hui-placeholder);
  }
  .hui-input:focus {
    border-color: var(--hui-primary);
    box-shadow: 0 0 0 1px var(--hui-primary);
  }
  .hui-input[aria-invalid="true"] {
    border-color: var(--hui-danger);
  }
  .hui-input[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 1px var(--hui-danger);
  }
  .hui-input:disabled {
    color: var(--hui-muted);
    background: var(--hui-surface-muted);
    cursor: not-allowed;
  }
  .hui-input[data-select-only] {
    cursor: pointer;
    caret-color: transparent;
  }
  .hui-input-wrapper[data-left-section] > .hui-input {
    padding-inline-start: var(--hui-left-section-width, 34px);
  }
  .hui-input-wrapper[data-right-section] > .hui-input {
    padding-inline-end: var(--hui-right-section-width, 34px);
  }
  .hui-input-section {
    position: absolute;
    inset-block: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    font-size: 14px;
    color: var(--hui-muted);
    pointer-events: none;
  }
  .hui-input-section[data-position="left"] {
    inset-inline-start: 0;
    width: var(--hui-left-section-width, 34px);
  }
  .hui-input-section[data-position="right"] {
    inset-inline-end: 0;
    width: var(--hui-right-section-width, 34px);
  }
  .hui-section-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    pointer-events: auto;
    transition:
      color 120ms ease,
      transform 100ms ease-out;
  }
  .hui-section-button:active {
    transform: scale(0.92);
  }
  .hui-section-button:focus-visible {
    outline: 2px solid var(--hui-primary);
    outline-offset: 1px;
  }
  @media (hover: hover) and (pointer: fine) {
    .hui-section-button:hover {
      color: var(--hui-text);
    }
  }
  .hui-dropdown {
    z-index: 300;
    box-sizing: border-box;
    margin: 0;
    padding: 4px;
    overflow-y: auto;
    font-size: 14px;
    color: var(--hui-text);
    list-style: none;
    background: var(--hui-surface);
    border: 1px solid var(--hui-border);
    border-radius: var(--hui-radius);
    box-shadow:
      0 1px 3px rgb(0 0 0 / 0.05),
      0 10px 24px -8px rgb(0 0 0 / 0.16);
    transform-origin: top center;
    transition:
      opacity 150ms var(--hui-ease-out),
      scale 150ms var(--hui-ease-out);
  }
  .hui-dropdown[data-side="top"] {
    transform-origin: bottom center;
  }
  @starting-style {
    .hui-dropdown {
      opacity: 0;
      scale: 0.96;
    }
  }
  .hui-option-group-label {
    padding: 8px 10px 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--hui-muted);
  }
  .hui-option {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 7px 10px;
    border-radius: calc(var(--hui-radius) - 2px);
    cursor: pointer;
    user-select: none;
  }
  .hui-option[data-active] {
    background: var(--hui-surface-muted);
  }
  .hui-option[aria-disabled="true"] {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .hui-option-check {
    flex: none;
    width: 14px;
    height: 14px;
  }
  .hui-option[data-check-position="right"] > .hui-option-check {
    order: 1;
    margin-inline-start: auto;
  }
  .hui-country-trigger {
    gap: 4px;
    width: auto;
    height: 28px;
    padding-inline: 6px;
    font: inherit;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    color: var(--hui-text);
  }
  .hui-country-trigger > svg {
    color: var(--hui-muted);
  }
  .hui-country-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .hui-country-flag {
    font-size: 16px;
    line-height: 1;
  }
  .hui-dropdown.hui-country-dropdown {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
  .hui-country-search {
    flex: none;
    padding: 4px;
    border-bottom: 1px solid var(--hui-border);
  }
  .hui-country-search > .hui-input {
    min-height: 32px;
    border-color: transparent;
    box-shadow: none;
  }
  .hui-country-list {
    flex: 1;
    min-height: 0;
    padding: 4px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .hui-country-list > .hui-option {
    gap: 10px;
  }
  .hui-option[data-selected] > .hui-country-name {
    font-weight: 500;
  }
  .hui-country-dial {
    margin-inline-start: auto;
    color: var(--hui-muted);
    font-variant-numeric: tabular-nums;
  }
  .hui-nothing-found {
    padding: 8px 10px;
    color: var(--hui-muted);
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-dropdown {
      transition: opacity 150ms ease;
    }
    @starting-style {
      .hui-dropdown {
        scale: 1;
      }
    }
    .hui-section-button:active {
      transform: none;
    }
  }
}`;
