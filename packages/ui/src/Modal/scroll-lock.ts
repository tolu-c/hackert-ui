let locks = 0;
let restore: (() => void) | undefined;

// Stops the page behind open modals from scrolling. Counted, so the page is
// released only when the last modal closes. The scrollbar's width is added as
// padding so the content does not shift when the scrollbar disappears.
export function lockScroll(): () => void {
  if (locks === 0) {
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${padding + scrollbar}px`;
    restore = () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }
  locks++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks--;
    if (locks === 0) {
      restore?.();
      restore = undefined;
    }
  };
}
