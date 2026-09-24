import { createFileRoute } from "@tanstack/react-router";
import ResellerRegister from "@/pages/reseller/ResellerRegister";

export const Route = createFileRoute("/reseller/register")({
  head: () => ({
    meta: [
      { title: "Become a Verified Reseller Partner | GCOS" },
      {
        name: "description",
        content:
          "Register as a GCOS reseller partner today. Launch your custom online store with zero inventory risk, competitive margins, and automated logistics.",
      },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: "Become a Verified Reseller Partner | GCOS" },
      {
        property: "og:description",
        content: "Register as a GCOS reseller partner today. Launch your custom online shop with zero inventory risk.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/reseller/register" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://globalcart-onlineshop.com/reseller/register" },
    ],
  }),
  component: ResellerRegisterRoutePage,
});

function ResellerRegisterRoutePage() {
  return <ResellerRegister />;
}
