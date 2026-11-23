import { type RefObject, useEffect, useEffectEvent, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(callback: () => void): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const onClickOutside = useEffectEvent(callback);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return ref;
}
