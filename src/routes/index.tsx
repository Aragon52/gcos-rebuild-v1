import { createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/Index";
import { detectPortal } from "@/lib/subdomain";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const portal = detectPortal();
    if (portal === "reseller") {
      throw redirect({ to: "/reseller/dashboard" });
    }
    if (portal === "admin") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Shop online | GCOS global marketplace" },
      { name: "description", content: "Explore products, categories, deals, and independent reseller stores on GCOS, a global online marketplace." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Shop online | GCOS global marketplace" },
      { property: "og:description", content: "Explore products, categories, deals, and independent reseller stores on GCOS, a global online marketplace." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRoutePage,
});

function HomeRoutePage() {
  return <MainLayout><HomePage /></MainLayout>;
}
