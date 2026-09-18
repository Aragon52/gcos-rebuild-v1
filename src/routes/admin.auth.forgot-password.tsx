import { createFileRoute } from "@tanstack/react-router";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword";

export const Route = createFileRoute("/admin/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset admin password — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reset admin password — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAuthForgotPasswordRoutePage,
});

function AdminAuthForgotPasswordRoutePage() {
  return <AdminForgotPassword />;
}
