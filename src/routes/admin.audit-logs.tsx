import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuditLogsPage from "@/pages/admin/AdminAuditLogsPage";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit logs — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Audit logs — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAuditLogsRoutePage,
});

function AdminAuditLogsRoutePage() {
  return <AdminLayout><AdminAuditLogsPage /></AdminLayout>;
}
