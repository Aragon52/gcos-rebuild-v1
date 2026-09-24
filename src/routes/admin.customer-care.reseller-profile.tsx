import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ResellerProfilePage from "@/pages/admin/ResellerProfilePage";

export const Route = createFileRoute("/admin/customer-care/reseller-profile")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomerCareResellerProfileRoutePage,
});

function AdminCustomerCareResellerProfileRoutePage() {
  return <AdminLayout><ResellerProfilePage /></AdminLayout>;
}
