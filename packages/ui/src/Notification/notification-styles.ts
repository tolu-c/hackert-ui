// Layer prelude and placement as in Button's stylesheet; see button-styles.ts.
// Each notification sits in a grid slot whose single row animates between 0fr
// and 1fr, so neighbours glide into place instead of jumping when one enters or
// leaves. Exits are faster than entries.
export const NOTIFICATION_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-notification {
    --hui-surface: light-dark(#ffffff, #18181b);
    --hui-text: light-dark(#18181b, #f4f4f5);
    --hui-muted: light-dark(#52525b, #a1a1aa);
    --hui-border: light-dark(#e4e4e7, #27272a);
    position: relative;
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
    padding: 12px 10px 12px 12px;
    color: var(--hui-text);
    font-family: var(--hui-font);
    background: var(--hui-surface);
    border: 1px solid var(--hui-border);
    border-radius: var(--hui-radius);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.05),
      0 8px 24px -8px rgb(0 0 0 / 0.18);
  }
  .hui-notification:not([data-with-icon])::before {
    content: "";
    flex: none;
    align-self: stretch;
    width: 4px;
    background: var(--hui-accent);
    border-radius: 4px;
  }
  .hui-notification-icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--hui-accent-text);
    background: var(--hui-accent-tint);
    border-radius: 50%;
  }
  .hui-notification-icon[data-loading] {
    color: var(--hui-accent);
    background: transparent;
  }
  .hui-notification-icon > svg {
    width: 16px;
    height: 16px;
  }
  .hui-notification-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-block: 3px;
    overflow-wrap: anywhere;
  }
  .hui-notification-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  .hui-notification-message {
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: var(--hui-muted);
  }
  .hui-notification-title + .hui-notification-message {
    font-size: 13px;
  }
  .hui-notification > .hui-close-button {
    margin-block-start: 1px;
  }
  .hui-notifications {
    position: fixed;
    z-index: var(--hui-notifications-z, 400);
    width: min(400px, 100vw - 32px);
    pointer-events: none;
  }
  .hui-notifications-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .hui-notifications[data-position^="top"] {
    top: 12px;
    --hui-enter-y: -12px;
  }
  /* Newest sits nearest the screen edge. */
  .hui-notifications[data-position^="top"] > .hui-notifications-list {
    flex-direction: column-reverse;
  }
  .hui-notifications[data-position^="bottom"] {
    bottom: 12px;
    --hui-enter-y: 12px;
  }
  .hui-notifications[data-position$="right"] {
    right: 16px;
  }
  .hui-notifications[data-position$="left"] {
    left: 16px;
  }
  .hui-notifications[data-position$="center"] {
    left: 50%;
    translate: -50% 0;
  }
  .hui-notification-slot {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 320ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  @starting-style {
    .hui-notification-slot {
      grid-template-rows: 0fr;
    }
  }
  .hui-notification-slot[data-leaving] {
    grid-template-rows: 0fr;
    transition-duration: 200ms;
  }
  .hui-notification-clip {
    min-height: 0;
  }
  .hui-notification-slot[data-leaving] > .hui-notification-clip {
    overflow: hidden;
  }
  .hui-notification-clip > .hui-notification {
    margin-block: 4px;
    pointer-events: auto;
    transition:
      opacity 320ms ease,
      translate 320ms cubic-bezier(0.23, 1, 0.32, 1),
      scale 320ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  @starting-style {
    .hui-notification-clip > .hui-notification {
      opacity: 0;
      translate: 0 var(--hui-enter-y);
      scale: 0.96;
    }
  }
  .hui-notification-slot[data-leaving] .hui-notification {
    opacity: 0;
    scale: 0.96;
    transition-duration: 200ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-notification-slot,
    .hui-notification-slot[data-leaving] {
      transition: none;
    }
    .hui-notification-slot[data-leaving] .hui-notification {
      scale: 1;
    }
    @starting-style {
      .hui-notification-clip > .hui-notification {
        translate: none;
        scale: 1;
      }
    }
  }
}`;
