import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { SystemLogsPage } from "@/pages/admin/AdminPlaceholderPages";

export const Route = createFileRoute("/admin/system-logs")({
  head: () => ({
    meta: [
      { title: "System logs — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "System logs — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSystemLogsRoutePage,
});

function AdminSystemLogsRoutePage() {
  return <AdminLayout><SystemLogsPage /></AdminLayout>;
}
