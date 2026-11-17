import { useId } from "react";
import { type Preference, PREFERENCES, setPreference, usePreference } from "@/color-scheme";

const LABEL: Readonly<Record<Preference, string>> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ColorSchemeSwitcher() {
  const name = useId();
  const current = usePreference();

  return (
    <fieldset className="flex rounded-full border border-line p-0.5">
      <legend className="sr-only">Colour scheme</legend>
      {PREFERENCES.map((preference) => (
        <label
          key={preference}
          title={LABEL[preference]}
          className="grid size-7 cursor-pointer place-items-center rounded-full text-fg-muted transition-colors duration-150 hover:text-fg has-checked:bg-muted has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-fg"
        >
          <input
            type="radio"
            name={name}
            value={preference}
            checked={current === preference}
            onChange={() => setPreference(preference)}
            className="sr-only"
          />
          <span className="sr-only">{LABEL[preference]}</span>
          <SchemeIcon preference={preference} />
        </label>
      ))}
    </fieldset>
  );
}

function SchemeIcon({ preference }: { readonly preference: Preference }) {
  const shared = {
    viewBox: "0 0 16 16",
    className: "size-3.5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;

  if (preference === "light") {
    return (
      <svg {...shared}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
      </svg>
    );
  }
  if (preference === "dark") {
    return (
      <svg {...shared}>
        <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <rect x="2" y="2.5" width="12" height="8.5" rx="1.5" />
      <path d="M5.5 13.5h5M8 11v2.5" />
    </svg>
  );
}
