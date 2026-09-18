import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";

export const Route = createFileRoute("/cart/login")({
  head: () => ({
    meta: [
      { title: "Sign in — GCOS" },
      { name: "description", content: "Sign in to your GCOS account." },
      { property: "og:title", content: "Sign in — GCOS" },
      { property: "og:description", content: "Sign in to your GCOS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartLoginRoutePage,
});

function CartLoginRoutePage() {
  return <MainLayout><Login /></MainLayout>;
}
