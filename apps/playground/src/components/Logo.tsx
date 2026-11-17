// Three of four tiles: the stem and leg of an "h", with the empty corner for
// "take only the packages you need". The leg uses the theme's primary blue.
export function LogoMark({ className = "size-5" }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill="currentColor" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill="currentColor" />
      <rect
        x="13"
        y="13"
        width="9"
        height="9"
        rx="2.5"
        className="fill-blue-600 dark:fill-blue-500"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-fg">
      <LogoMark />
      hackert-ui
    </span>
  );
}
