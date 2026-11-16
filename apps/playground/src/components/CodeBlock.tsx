import { useEffect, useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

const STATUS_LABEL: Readonly<Record<CopyStatus, string>> = {
  idle: "Copy code",
  copied: "Copied",
  failed: "Copy failed",
};

interface CodeBlockProps {
  readonly code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") {
      return;
    }
    const id = setTimeout(() => setStatus("idle"), 1500);
    return () => clearTimeout(id);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch (error) {
      console.error("playground: copying code failed", error);
      setStatus("failed");
    }
  }

  return (
    <div className="relative bg-slate-50">
      <pre className="overflow-x-auto p-4 pr-14 text-xs leading-relaxed text-slate-700">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={STATUS_LABEL[status]}
        title={STATUS_LABEL[status]}
        className="absolute top-2.5 right-2.5 grid size-8 cursor-pointer place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-[color,transform] duration-150 ease-out hover:text-slate-900 active:scale-97 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-colors"
      >
        <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
          <CopyIcon visible={status === "idle"} />
          <CheckIcon visible={status === "copied"} />
          <CrossIcon visible={status === "failed"} />
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "idle" ? "" : STATUS_LABEL[status]}
      </span>
    </div>
  );
}

interface IconProps {
  readonly visible: boolean;
}

// Icons cross-fade with a slight blur so the swap reads as one change.
function iconClass(visible: boolean) {
  return `size-4 transition-[opacity,filter] duration-150 ease-out ${
    visible ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
  }`;
}

function CopyIcon({ visible }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={iconClass(visible)} aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="8.5"
        height="8.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon({ visible }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`${iconClass(visible)} text-emerald-600`}
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon({ visible }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={`${iconClass(visible)} text-red-600`} aria-hidden="true">
      <path
        d="M4.5 4.5l7 7m0-7l-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
