import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hooks/")({
  beforeLoad: () => {
    throw redirect({ to: "/hooks/use-disclosure", replace: true });
  },
});
