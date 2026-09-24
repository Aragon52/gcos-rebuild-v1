import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ACHFinancialPage from "@/pages/admin/ACHFinancialPage";

export const Route = createFileRoute("/admin/ach/financial")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAchFinancialRoutePage,
});

function AdminAchFinancialRoutePage() {
  return <AdminLayout><ACHFinancialPage /></AdminLayout>;
}
