import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminOrdersRoutePage,
});

function AdminOrdersRoutePage() {
  return <AdminLayout><AdminOrdersPage /></AdminLayout>;
}
