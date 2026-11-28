// Layer prelude and placement as in Button's stylesheet; see button-styles.ts.
// The placeholder is an ::after layer rather than the element's own background,
// so wrapped children keep their box (and the page its layout) while covered.
export const SKELETON_CSS = `@layer theme, base, components, utilities;
@layer components {
  .hui-skeleton {
    position: relative;
  }
  .hui-skeleton[data-visible] {
    overflow: hidden;
  }
  .hui-skeleton[data-visible] > * {
    visibility: hidden;
  }
  .hui-skeleton[data-visible]::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background: light-dark(#e4e4e7, #3f3f46);
    border-radius: inherit;
  }
  .hui-skeleton[data-visible][data-animate]::after {
    animation: hui-skeleton-pulse 1600ms ease-in-out infinite;
  }
  @keyframes hui-skeleton-pulse {
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hui-skeleton[data-visible][data-animate]::after {
      animation: none;
    }
  }
}`;
