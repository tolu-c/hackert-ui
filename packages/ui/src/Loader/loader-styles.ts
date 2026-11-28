// Layer prelude and placement as in Button's stylesheet; see button-styles.ts.
// Each loader is sized from --hui-loader-size and painted with currentColor, so
// it inherits the text colour of whatever it sits in.
export const LOADER_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-loader {
    box-sizing: border-box;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--hui-loader-size);
    height: var(--hui-loader-size);
    color: var(--hui-loader-color);
  }
  .hui-loader[data-type="oval"] {
    border: max(2px, calc(var(--hui-loader-size) / 9)) solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: hui-loader-spin 700ms linear infinite;
  }
  .hui-loader[data-type="bars"] {
    gap: calc(var(--hui-loader-size) / 8);
  }
  .hui-loader[data-type="bars"] > span {
    width: calc(var(--hui-loader-size) / 5);
    height: 100%;
    background: currentColor;
    border-radius: calc(var(--hui-loader-size) / 16);
    animation: hui-loader-bar 900ms ease-in-out infinite;
  }
  .hui-loader[data-type="dots"] {
    gap: calc(var(--hui-loader-size) / 8);
  }
  .hui-loader[data-type="dots"] > span {
    width: calc(var(--hui-loader-size) / 4);
    height: calc(var(--hui-loader-size) / 4);
    background: currentColor;
    border-radius: 50%;
    animation: hui-loader-dot 900ms ease-in-out infinite;
  }
  /* Negative delays start each part mid-cycle, so the wave is already moving on mount. */
  .hui-loader > span:nth-child(1) {
    animation-delay: -300ms;
  }
  .hui-loader > span:nth-child(2) {
    animation-delay: -150ms;
  }
  @keyframes hui-loader-spin {
    to {
      rotate: 1turn;
    }
  }
  @keyframes hui-loader-bar {
    0%,
    100% {
      scale: 1 0.4;
      opacity: 0.5;
    }
    50% {
      scale: 1 1;
      opacity: 1;
    }
  }
  @keyframes hui-loader-dot {
    0%,
    100% {
      scale: 0.6;
      opacity: 0.4;
    }
    50% {
      scale: 1;
      opacity: 1;
    }
  }
  /* A frozen loader reads as a hang, so reduced motion slows it rather than stopping it. */
  @media (prefers-reduced-motion: reduce) {
    .hui-loader[data-type="oval"] {
      animation-duration: 1600ms;
    }
    .hui-loader > span {
      animation-duration: 1800ms;
    }
  }
}`;
