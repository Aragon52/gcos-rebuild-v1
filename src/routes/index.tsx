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
      { title: "GCOS — Global Commerce Online Store & Marketplace" },
      {
        name: "description",
        content:
          "Shop premium products across Electronics, Fashion, Home, Beauty, and Sports on GCOS. Discover verified reseller stores with secure worldwide checkout.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "GCOS — Global Commerce Online Store & Marketplace" },
      {
        property: "og:description",
        content:
          "Shop premium products across Electronics, Fashion, Home, Beauty, and Sports on GCOS. Discover verified reseller stores with secure worldwide checkout.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/" },
      { property: "og:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
    ],
    links: [
      { rel: "canonical", href: "https://globalcart-onlineshop.com/" },
    ],
  }),
  component: HomeRoutePage,
});

function HomeRoutePage() {
  return <MainLayout><HomePage /></MainLayout>;
}
