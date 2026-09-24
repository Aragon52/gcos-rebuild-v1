import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { SecurityPage } from "@/pages/admin/AdminPlaceholderPages";

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
  return <AdminLayout><SecurityPage /></AdminLayout>;
}
