import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { SecurityPage } from "@/pages/admin/AdminPlaceholderPages";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Security — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Security — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSecurityRoutePage,
});

function AdminSecurityRoutePage() {
  return <AdminLayout><SecurityPage /></AdminLayout>;
}
