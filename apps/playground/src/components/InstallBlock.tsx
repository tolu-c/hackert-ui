import { type KeyboardEvent, useId, useRef, useSyncExternalStore } from "react";
import { installCommand, type Manager, MANAGERS, type PackageId } from "@/install";
import { CodeBlock } from "./CodeBlock";

// The chosen manager is shared by every install block and remembered per viewer.
const STORAGE_KEY = "hui-playground-package-manager";
const listeners = new Set<() => void>();
let manager = loadManager();

function loadManager(): Manager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MANAGERS.find((option) => option === stored) ?? "pnpm";
  } catch {
    return "pnpm";
  }
}

function selectManager(next: Manager) {
  manager = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies now.
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useManager(): Manager {
  return useSyncExternalStore(subscribe, () => manager);
}

interface InstallBlockProps {
  readonly packages: readonly PackageId[];
}

export function InstallBlock({ packages }: InstallBlockProps) {
  const current = useManager();
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const command = installCommand(current, packages);
  const [verb, ...rest] = command.split(" ");

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step === undefined) {
      return;
    }
    event.preventDefault();
    const nextIndex = (index + step + MANAGERS.length) % MANAGERS.length;
    const next = MANAGERS[nextIndex];
    if (next) {
      selectManager(next);
      tabs.current[nextIndex]?.focus();
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Package manager" className="flex">
        {MANAGERS.map((option, index) => {
          const selected = option === current;
          return (
            <button
              key={option}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-${option}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectManager(option)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2.5 font-mono text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-fg aria-selected:bg-subtle aria-selected:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg"
            >
              <ManagerLogo manager={option} />
              {option}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${current}`}
        className="overflow-hidden rounded-lg rounded-tl-none text-sm"
      >
        <CodeBlock code={command}>
          <span className="text-amber-700 dark:text-amber-400">{verb}</span>{" "}
          <span className="text-sky-800 dark:text-sky-300">{rest.join(" ")}</span>
        </CodeBlock>
      </div>
    </div>
  );
}

function ManagerLogo({ manager: option }: { readonly manager: Manager }) {
  if (option === "pnpm") {
    return (
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <rect x="0" y="0" width="4.5" height="4.5" fill="#f9ad00" />
        <rect x="5.75" y="0" width="4.5" height="4.5" fill="#f9ad00" />
        <rect x="11.5" y="0" width="4.5" height="4.5" fill="#f9ad00" />
        <rect x="11.5" y="5.75" width="4.5" height="4.5" fill="#f9ad00" />
        <rect x="0" y="11.5" width="4.5" height="4.5" fill="currentColor" />
        <rect x="5.75" y="5.75" width="4.5" height="4.5" fill="currentColor" />
        <rect x="5.75" y="11.5" width="4.5" height="4.5" fill="currentColor" />
        <rect x="11.5" y="11.5" width="4.5" height="4.5" fill="currentColor" />
      </svg>
    );
  }
  if (option === "yarn") {
    return (
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#2c8ebb" />
        <path
          d="M5 4.5c1 1.5 2 2.6 3 3.2m3-3.2C9.7 7 8.6 9 7.4 11.6"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <rect width="16" height="16" fill="#cb3837" />
      <path d="M3 3h10v10h-2.5V5.5H8V13H3Z" fill="#fff" />
    </svg>
  );
}
