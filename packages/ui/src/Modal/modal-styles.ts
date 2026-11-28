// Layer prelude and placement as in Button's stylesheet; see button-styles.ts.
// The modal is a native <dialog> opened with showModal(), so the browser puts it
// in the top layer, traps focus and makes the page inert. The dialog is a flex
// column sized by its content up to 75dvh: the header never scrolls, and the
// body shrinks and scrolls once the content is taller than that. Exits animate where
// `display`/`overlay` transitions are supported and are instant elsewhere.
export const MODAL_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-modal {
    --hui-surface: light-dark(#ffffff, #18181b);
    --hui-text: light-dark(#18181b, #f4f4f5);
    --hui-muted: light-dark(#71717a, #a1a1aa);
    --hui-modal-offset: 5dvh;
    --hui-modal-ease: cubic-bezier(0.23, 1, 0.32, 1);
    box-sizing: border-box;
    flex-direction: column;
    width: min(var(--hui-modal-width, 620px), 100% - 32px);
    max-width: none;
    height: fit-content;
    max-height: 75dvh;
    margin: var(--hui-modal-offset) auto auto;
    padding: 0;
    overflow: hidden;
    color: var(--hui-text);
    font-family: var(--hui-font);
    background: var(--hui-surface);
    border: 1px solid light-dark(transparent, #27272a);
    border-radius: var(--hui-radius);
    box-shadow:
      0 1px 3px rgb(0 0 0 / 0.08),
      0 24px 48px -12px rgb(0 0 0 / 0.28);
    opacity: 0;
    translate: 0 8px;
    scale: 0.98;
    transition:
      opacity 150ms ease,
      translate 150ms var(--hui-modal-ease),
      scale 150ms var(--hui-modal-ease),
      display 150ms allow-discrete,
      overlay 150ms allow-discrete;
  }
  .hui-modal[open] {
    display: flex;
    opacity: 1;
    translate: none;
    scale: 1;
    transition-duration: 240ms;
  }
  @starting-style {
    .hui-modal[open] {
      opacity: 0;
      translate: 0 8px;
      scale: 0.98;
    }
  }
  .hui-modal[data-centered] {
    margin: auto;
  }
  .hui-modal[data-size="auto"] {
    width: fit-content;
    max-width: calc(100% - 32px);
  }
  .hui-modal[open][data-stack-hidden] {
    opacity: 0;
    scale: 0.98;
    pointer-events: none;
  }
  .hui-modal::backdrop {
    background-color: rgb(0 0 0 / 0);
    transition:
      background-color 150ms ease,
      display 150ms allow-discrete,
      overlay 150ms allow-discrete;
  }
  .hui-modal[open]::backdrop {
    background-color: rgb(0 0 0 / 0.5);
    transition-duration: 240ms;
  }
  @starting-style {
    .hui-modal[open]::backdrop {
      background-color: rgb(0 0 0 / 0);
    }
  }
  .hui-modal[open][data-stack-hidden]::backdrop {
    background-color: rgb(0 0 0 / 0);
  }
  .hui-modal-header {
    display: flex;
    flex: none;
    gap: 16px;
    align-items: flex-start;
    padding: 20px 20px 16px;
  }
  .hui-modal-heading {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .hui-modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.35;
  }
  .hui-modal-description {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--hui-muted);
  }
  .hui-modal-header > .hui-close-button {
    margin-block-start: -2px;
    margin-inline: auto -6px;
  }
  .hui-modal-body {
    flex: 0 1 auto;
    min-height: 0;
    padding: 20px;
    overflow-y: auto;
    overscroll-behavior: contain;
    font-size: 14px;
    line-height: 1.6;
  }
  .hui-modal-header + .hui-modal-body {
    padding-top: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-modal,
    .hui-modal[open][data-stack-hidden] {
      translate: none;
      scale: 1;
    }
    @starting-style {
      .hui-modal[open] {
        translate: none;
        scale: 1;
      }
    }
  }
}`;
