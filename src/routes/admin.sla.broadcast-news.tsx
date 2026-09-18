import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import BroadcastNewsPage from "@/pages/admin/BroadcastNewsPage";

export const Route = createFileRoute("/admin/sla/broadcast-news")({
  head: () => ({
    meta: [
      { title: "Broadcast news — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Broadcast news — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaBroadcastNewsRoutePage,
});

function AdminSlaBroadcastNewsRoutePage() {
  return <AdminLayout><BroadcastNewsPage /></AdminLayout>;
}
