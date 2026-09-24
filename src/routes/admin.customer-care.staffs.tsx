import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAUserPage from "@/pages/admin/SLAUserPage";

export const Route = createFileRoute("/admin/customer-care/staffs")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomerCareStaffsRoutePage,
});

function AdminCustomerCareStaffsRoutePage() {
  return <AdminLayout><SLAUserPage /></AdminLayout>;
}
