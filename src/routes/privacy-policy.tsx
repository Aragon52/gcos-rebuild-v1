import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | GlobalCart Online Shop" },
      { name: "description", content: "Privacy policy, data protection, and GDPR/CCPA/PDPA compliance for GlobalCart International Pte. Ltd." },
      { property: "og:title", content: "Privacy Policy | GlobalCart Online Shop" },
      { property: "og:description", content: "Privacy policy and international data protection standards at GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <PrivacyPolicy />
    </MainLayout>
  ),
});
