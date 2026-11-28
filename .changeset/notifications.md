---
"@hackert-ui/ui": minor
---

Notifications are implemented.

- Mount `<Notifications />` once, then call `notifications.show({ title, message, color, icon, loading, autoClose, withCloseButton, onClose })` from anywhere, including outside React. `show` returns an id for `notifications.update(id, data)` and `notifications.hide(id)`; `notifications.clean()` hides them all. Showing an existing id updates it in place.
- Notifications close after 4 seconds by default (`autoClose: false` keeps one open). They don't close while `loading`, and an update restarts the timer. Every timer pauses while the pointer is over the stack, while focus is inside it, and while the tab is hidden.
- `<Notifications position limit zIndex />` takes six positions (default `bottom-right`). The newest notification sits nearest the screen edge, and any beyond `limit` (default 5) wait their turn. Entries and exits animate, and neighbours slide into place.
- `<Notification />` is the card on its own: a colour bar, or an icon, or a spinner while `loading`, plus a title, a message and a close button.
- `useNotify()` returns the `notifications` API, and `useNotifications()` returns the live list for custom rendering.
- `react-dom` is now a peer dependency of `@hackert-ui/ui`.
