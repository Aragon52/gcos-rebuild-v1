import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomersRoutePage,
});

function AdminCustomersRoutePage() {
  return <AdminLayout><AdminCustomersPage /></AdminLayout>;
}
