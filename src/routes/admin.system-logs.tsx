import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { SystemLogsPage } from "@/pages/admin/AdminPlaceholderPages";

export const Route = createFileRoute("/admin/system-logs")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSystemLogsRoutePage,
});

function AdminSystemLogsRoutePage() {
  return <AdminLayout><SystemLogsPage /></AdminLayout>;
}
