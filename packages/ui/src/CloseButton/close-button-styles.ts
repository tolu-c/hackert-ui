// Layer prelude and placement as in Button's stylesheet; see button-styles.ts.
export const CLOSE_BUTTON_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-close-button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--hui-close-size);
    height: var(--hui-close-size);
    padding: 0;
    color: light-dark(#71717a, #a1a1aa);
    background: transparent;
    border: 0;
    border-radius: var(--hui-radius);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  .hui-close-button > svg {
    width: 55%;
    height: 55%;
  }
  @media (hover: hover) and (pointer: fine) {
    .hui-close-button:hover:not(:disabled) {
      color: light-dark(#18181b, #f4f4f5);
      background: light-dark(#f4f4f5, #27272a);
    }
  }
  .hui-close-button:active:not(:disabled) {
    transform: scale(0.94);
  }
  .hui-close-button:focus-visible {
    outline: 2px solid var(--hui-ring);
    outline-offset: 1px;
  }
  .hui-close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-close-button:active:not(:disabled) {
      transform: none;
    }
  }
}`;
