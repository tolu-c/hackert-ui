import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ModalStackContextValue {
  // The stackId of the most recently opened modal.
  readonly top: string | undefined;
  readonly report: (stackId: string, opened: boolean) => void;
}

const ModalStackContext = createContext<ModalStackContextValue | null>(null);

export interface ModalStackProps {
  readonly children?: ReactNode;
}

// Groups modals registered with a stackId: only the most recently opened one is
// shown, over one backdrop, and closing it reveals the one beneath.
export function ModalStack({ children }: ModalStackProps) {
  const [order, setOrder] = useState<readonly string[]>([]);

  const report = useCallback((stackId: string, opened: boolean) => {
    setOrder((current) => {
      const listed = current.includes(stackId);
      if (opened) return listed ? current : [...current, stackId];
      return listed ? current.filter((id) => id !== stackId) : current;
    });
  }, []);

  const value = useMemo(() => ({ top: order.at(-1), report }), [order, report]);

  return <ModalStackContext value={value}>{children}</ModalStackContext>;
}

// Whether a modal is covered by a later one in its stack.
export function useStackHidden(stackId: string | undefined, opened: boolean): boolean {
  const stack = use(ModalStackContext);
  const report = stack?.report;

  useEffect(() => {
    if (!report || stackId === undefined || !opened) return;
    report(stackId, true);
    return () => report(stackId, false);
  }, [report, stackId, opened]);

  if (!stack || stackId === undefined || !opened) return false;
  return stack.top !== undefined && stack.top !== stackId;
}
