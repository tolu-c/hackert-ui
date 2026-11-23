export function toErrorMessages(errors: readonly unknown[]): string[] {
  const messages = new Set<string>();
  collect(errors, messages);
  return [...messages];
}

function collect(error: unknown, messages: Set<string>) {
  if (Array.isArray(error)) {
    for (const item of error) collect(item, messages);
  } else if (typeof error === "string") {
    if (error) messages.add(error);
  } else if (typeof error === "object" && error !== null && "message" in error) {
    collect(error.message, messages);
  } else if (typeof error === "object" && error !== null && "form" in error) {
    // TanStack only unwraps `{ form }` when `fields` is also present.
    collect(error.form, messages);
  }
}
