import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSWithdrawalPage from "@/pages/admin/ARSWithdrawalPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/withdrawal")({
  head: () => ({
    meta: [
      { title: "Withdrawals — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Withdrawals — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminArsWithdrawalRoutePage,
});

function AdminArsWithdrawalRoutePage() {
  return <RoleGuard path="/admin/ars/withdrawal"><AdminLayout><ARSWithdrawalPage /></AdminLayout></RoleGuard>;
}
