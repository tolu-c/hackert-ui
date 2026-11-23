---
"@hackert-ui/hooks": minor
---

Add `useCopy` and `useClickOutside`. `useCopy` copies text to the clipboard and reports `isCopied` for a moment (`timeout`, default 1000ms); it does nothing when the Clipboard API is missing. `useClickOutside` returns a ref and calls back on a mousedown or touchstart outside that element.
