import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ui/")({
  beforeLoad: () => {
    throw redirect({ to: "/ui/button", replace: true });
  },
});
