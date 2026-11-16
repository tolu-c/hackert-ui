import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/theme/")({
  beforeLoad: () => {
    throw redirect({ to: "/theme/colors", replace: true });
  },
});
