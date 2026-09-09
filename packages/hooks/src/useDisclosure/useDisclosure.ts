import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseDisclosureOptions {
  readonly onOpen?: (() => void) | undefined;
  readonly onClose?: (() => void) | undefined;
}

export interface UseDisclosureHandlers {
  readonly set: (value: boolean) => void;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

export type UseDisclosureReturnValue = readonly [
  boolean,
  UseDisclosureHandlers,
];

export function useDisclosure(
  initialState = false,
  options?: UseDisclosureOptions | undefined,
): UseDisclosureReturnValue {
  const [opened, setOpened] = useState(initialState);

  // Latest options are read through a ref so handlers stay referentially
  // stable. Assigned in an effect rather than during render, so a render React
  // discards cannot leave a stale callback behind.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Mirrors `opened` synchronously so a transition can be detected without
  // putting state in the handlers' dependency array. Re-synced after every
  // commit, so a render React discards cannot leave the mirror ahead of the
  // real state and make `set` drop a later update.
  const openedRef = useRef(opened);
  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  const set = useCallback((value: boolean) => {
    if (openedRef.current === value) {
      return;
    }

    openedRef.current = value;
    setOpened(value);

    const { onOpen, onClose } = optionsRef.current ?? {};
    if (value) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, []);

  const handlers = useMemo<UseDisclosureHandlers>(
    () => ({
      set,
      open: () => set(true),
      close: () => set(false),
      toggle: () => set(!openedRef.current),
    }),
    [set],
  );

  return [opened, handlers];
}
