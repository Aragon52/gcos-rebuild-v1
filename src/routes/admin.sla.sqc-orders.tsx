import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SQCVirtualOrdersPage from "@/pages/admin/SQCVirtualOrdersPage";

export const Route = createFileRoute("/admin/sla/sqc-orders")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaSqcOrdersRoutePage,
});

function AdminSlaSqcOrdersRoutePage() {
  return <AdminLayout><SQCVirtualOrdersPage /></AdminLayout>;
}
