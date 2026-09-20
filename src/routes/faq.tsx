import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import FAQ from "@/pages/FAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ & Trust Center | GlobalCart Online Shop" },
      { name: "description", content: "Frequently asked questions about GlobalCart payment security, buyer protection, shipping, and seller verification." },
      { property: "og:title", content: "FAQ & Trust Center | GlobalCart Online Shop" },
      { property: "og:description", content: "Frequently asked questions and trust center information for GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <FAQ />
    </MainLayout>
  ),
});
