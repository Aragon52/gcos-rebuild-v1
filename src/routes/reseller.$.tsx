import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reseller/$")({
  beforeLoad: () => {
    throw redirect({ to: "/reseller/login" });
  },
});
