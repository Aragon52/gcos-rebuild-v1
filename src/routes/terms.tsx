import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import TermsOfService from "@/pages/TermsOfService";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | GlobalCart Online Shop" },
      { name: "description", content: "Terms of service, buyer protection rules, and merchant guidelines for GlobalCart International Pte. Ltd." },
      { property: "og:title", content: "Terms of Service | GlobalCart Online Shop" },
      { property: "og:description", content: "User terms of service, merchant policies, and buyer guarantees at GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <TermsOfService />
    </MainLayout>
  ),
});
