import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import BroadcastNewsPage from "@/pages/admin/BroadcastNewsPage";

export const Route = createFileRoute("/admin/sla/broadcast-news")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaBroadcastNewsRoutePage,
});

function AdminSlaBroadcastNewsRoutePage() {
  return <AdminLayout><BroadcastNewsPage /></AdminLayout>;
}
