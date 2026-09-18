import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminResellersPage from "@/pages/admin/AdminResellersPage";

export const Route = createFileRoute("/admin/resellers")({
  head: () => ({
    meta: [
      { title: "Resellers — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Resellers — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminResellersRoutePage,
});

function AdminResellersRoutePage() {
  return <AdminLayout><AdminResellersPage /></AdminLayout>;
}
