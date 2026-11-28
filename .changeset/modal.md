---
"@hackert-ui/ui": minor
"@hackert-ui/hooks": minor
---

`Modal`, `CloseButton` and `useModalsStack` are implemented.

- `Modal` is built on the native `<dialog>` element, opened with `showModal()`. The browser traps focus and makes the page inert, and the page behind is scroll-locked. The modal grows with its content up to 75dvh. Past that, the header stays fixed and only the body scrolls. Props: `opened`, `onClose`, `title`, `description`, `size` (`xs`–`xl`, default `lg`; `auto` fits the content; a CSS width such as `"70%"`, or pixels), `centered`, `withCloseButton`, `closeButtonProps`, `closeOnEscape`, `closeOnClickOutside` and `radius`. Escape and backdrop clicks call `onClose` rather than closing the dialog themselves. Style the backdrop with Tailwind's `backdrop:` variant.
- Compound parts give full control: `Modal.Root`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton` and `Modal.Body`. `Modal.Title` and `Modal.Description` label and describe the dialog.
- `Modal.Stack` groups modals that pass a `stackId`. Only the most recently opened one is shown over the backdrop, and closing it reveals the one beneath.
- `CloseButton` is an X icon button named "Close", with `size` and an overridable icon (`children`) and label (`aria-label`).
- `@hackert-ui/hooks`: `useModalsStack(ids)` returns `state`, `open`, `close`, `toggle`, `closeAll` and `register(id)`, which spreads onto a `Modal` inside `Modal.Stack`.
