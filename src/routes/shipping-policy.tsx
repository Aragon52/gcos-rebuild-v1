import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ShippingPolicy from "@/pages/ShippingPolicy";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | GCOS" },
      { name: "description", content: "Learn how GCOS shipping, delivery estimates, customs, and delivery support work." },
      { property: "og:title", content: "Shipping Policy | GCOS" },
      { property: "og:description", content: "Learn how GCOS shipping and delivery support work." },
    ],
  }),
  component: () => <MainLayout><ShippingPolicy /></MainLayout>,
});
