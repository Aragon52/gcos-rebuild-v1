import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ACHCustomersPage from "@/pages/admin/ACHCustomersPage";

export const Route = createFileRoute("/admin/ach/customers")({
  head: () => ({
    meta: [
      { title: "ACH customers — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "ACH customers — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAchCustomersRoutePage,
});

function AdminAchCustomersRoutePage() {
  return <AdminLayout><ACHCustomersPage /></AdminLayout>;
}
