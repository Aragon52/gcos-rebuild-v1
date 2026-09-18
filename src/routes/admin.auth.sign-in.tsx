import { createFileRoute } from "@tanstack/react-router";
import AdminSignIn from "@/pages/admin/AdminSignIn";

export const Route = createFileRoute("/admin/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Admin sign in — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Admin sign in — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAuthSignInRoutePage,
});

function AdminAuthSignInRoutePage() {
  return <AdminSignIn />;
}
