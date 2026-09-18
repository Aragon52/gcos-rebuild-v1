import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAUserPage from "@/pages/admin/SLAUserPage";

export const Route = createFileRoute("/admin/customer-care/staffs")({
  head: () => ({
    meta: [
      { title: "Customer care staff — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Customer care staff — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCustomerCareStaffsRoutePage,
});

function AdminCustomerCareStaffsRoutePage() {
  return <AdminLayout><SLAUserPage /></AdminLayout>;
}
