import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$")({
  head: () => ({
    meta: [
      { title: "Admin Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  beforeLoad: ({ params }) => {
    const splat = (params as any)?._splat || "";
    if (splat.startsWith("store/") || splat === "store") {
      throw redirect({ to: `/${splat}` });
    }
    throw redirect({ to: "/admin/auth/sign-in" });
  },
});
