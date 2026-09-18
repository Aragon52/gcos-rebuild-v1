import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Orders from "@/pages/Orders";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My orders — GCOS" },
      { name: "description", content: "Track your GCOS orders." },
      { property: "og:title", content: "My orders — GCOS" },
      { property: "og:description", content: "Track your GCOS orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersRoutePage,
});

function OrdersRoutePage() {
  return <MainLayout><Orders /></MainLayout>;
}
