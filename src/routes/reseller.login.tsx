import { createFileRoute } from "@tanstack/react-router";
import ResellerLogin from "@/pages/reseller/ResellerLogin";

export const Route = createFileRoute("/reseller/login")({
  head: () => ({
    meta: [
      { title: "Reseller sign in — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reseller sign in — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerLoginRoutePage,
});

function ResellerLoginRoutePage() {
  return <ResellerLogin />;
}
