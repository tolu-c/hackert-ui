import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyProps {
  timeout?: number;
}
export function useCopy({ timeout = 1000 }: UseCopyProps = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    (value: string) => {
      if (!navigator.clipboard) return;
      void navigator.clipboard
        .writeText(value)
        .then(() => {
          if (!mountedRef.current) return;
          clearTimeout(timerRef.current);
          setIsCopied(true);
          timerRef.current = setTimeout(() => setIsCopied(false), timeout);
        })
        .catch(() => {});
    },
    [timeout],
  );

  return {
    copy,
    isCopied,
  };
}
