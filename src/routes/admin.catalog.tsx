import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCatalogPage from "@/pages/admin/AdminCatalogPage";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCatalogRoutePage,
});

function AdminCatalogRoutePage() {
  return (
    <AdminLayout>
      <AdminCatalogPage />
    </AdminLayout>
  );
}
