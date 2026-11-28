import { useCallback, useMemo, useState } from "react";

export interface ModalsStackRegistration<T extends string> {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly stackId: T;
}

export interface UseModalsStackReturnType<T extends string> {
  // Current opened state of each modal.
  readonly state: Readonly<Record<T, boolean>>;
  readonly open: (id: T) => void;
  readonly close: (id: T) => void;
  readonly toggle: (id: T) => void;
  // Closes every modal in the stack.
  readonly closeAll: () => void;
  // Props for <Modal> with the given id, inside <Modal.Stack>.
  readonly register: (id: T) => ModalsStackRegistration<T>;
}

function allClosed<T extends string>(ids: readonly T[]): Record<T, boolean> {
  return Object.fromEntries(ids.map((id) => [id, false])) as Record<T, boolean>;
}

export function useModalsStack<const T extends string>(
  ids: readonly T[],
): UseModalsStackReturnType<T> {
  const [state, setState] = useState(() => allClosed(ids));

  const set = useCallback((id: T, update: (opened: boolean) => boolean) => {
    setState((current) => ({ ...current, [id]: update(current[id]) }));
  }, []);
  const open = useCallback((id: T) => set(id, () => true), [set]);
  const close = useCallback((id: T) => set(id, () => false), [set]);
  const toggle = useCallback((id: T) => set(id, (opened) => !opened), [set]);
  const closeAll = useCallback(() => {
    setState((current) => allClosed(Object.keys(current) as T[]));
  }, []);

  const register = useCallback(
    (id: T): ModalsStackRegistration<T> => ({
      opened: state[id],
      onClose: () => close(id),
      stackId: id,
    }),
    [state, close],
  );

  return useMemo(
    () => ({ state, open, close, toggle, closeAll, register }),
    [state, open, close, toggle, closeAll, register],
  );
}
