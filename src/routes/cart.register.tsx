import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Register from "@/pages/Register";

export const Route = createFileRoute("/cart/register")({
  head: () => ({
    meta: [
      { title: "Create account — GCOS" },
      { name: "description", content: "Create your GCOS account." },
      { property: "og:title", content: "Create account — GCOS" },
      { property: "og:description", content: "Create your GCOS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartRegisterRoutePage,
});

function CartRegisterRoutePage() {
  return <MainLayout><Register /></MainLayout>;
}
