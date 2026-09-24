import { createFileRoute } from "@tanstack/react-router";
import ResellerLogin from "@/pages/reseller/ResellerLogin";

export const Route = createFileRoute("/reseller/login")({
  head: () => ({
    meta: [
      { title: "Reseller Partner Sign In | GCOS" },
      {
        name: "description",
        content:
          "Sign in to your GCOS reseller partner portal to manage your storefront, track product inventory, view earnings, and process orders.",
      },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: "Reseller Partner Sign In | GCOS" },
      {
        property: "og:description",
        content: "Sign in to your GCOS reseller partner portal to manage your storefront and earnings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/reseller/login" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://globalcart-onlineshop.com/reseller/login" },
    ],
  }),
  component: ResellerLoginRoutePage,
});

function ResellerLoginRoutePage() {
  return <ResellerLogin />;
}
