import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ACHFinancialPage from "@/pages/admin/ACHFinancialPage";

export const Route = createFileRoute("/admin/ach/financial")({
  head: () => ({
    meta: [
      { title: "ACH financial — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "ACH financial — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAchFinancialRoutePage,
});

function AdminAchFinancialRoutePage() {
  return <AdminLayout><ACHFinancialPage /></AdminLayout>;
}
