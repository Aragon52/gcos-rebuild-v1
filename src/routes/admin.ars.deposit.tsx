import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSDepositPage from "@/pages/admin/ARSDepositPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/deposit")({
  head: () => ({
    meta: [
      { title: "Deposits — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Deposits — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminArsDepositRoutePage,
});

function AdminArsDepositRoutePage() {
  return <RoleGuard path="/admin/ars/deposit"><AdminLayout><ARSDepositPage /></AdminLayout></RoleGuard>;
}
