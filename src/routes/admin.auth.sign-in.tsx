import { createFileRoute } from "@tanstack/react-router";
import AdminSignIn from "@/pages/admin/AdminSignIn";

export const Route = createFileRoute("/admin/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAuthSignInRoutePage,
});

function AdminAuthSignInRoutePage() {
  return <AdminSignIn />;
}
