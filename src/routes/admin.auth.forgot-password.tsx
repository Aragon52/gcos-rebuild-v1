import { createFileRoute } from "@tanstack/react-router";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword";

export const Route = createFileRoute("/admin/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAuthForgotPasswordRoutePage,
});

function AdminAuthForgotPasswordRoutePage() {
  return <AdminForgotPassword />;
}
