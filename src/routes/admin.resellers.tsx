import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminResellersPage from "@/pages/admin/AdminResellersPage";

export const Route = createFileRoute("/admin/resellers")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminResellersRoutePage,
});

function AdminResellersRoutePage() {
  return <AdminLayout><AdminResellersPage /></AdminLayout>;
}
