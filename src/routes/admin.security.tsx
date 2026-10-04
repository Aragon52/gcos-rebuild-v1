import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminSecurityPage } from "@/pages/admin/AdminSecurityPage";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSecurityRoutePage,
});

function AdminSecurityRoutePage() {
  return <AdminLayout><AdminSecurityPage /></AdminLayout>;
}
