import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import LegalNotice from "@/pages/LegalNotice";

export const Route = createFileRoute("/legal-notice")({
  head: () => ({
    meta: [
      { title: "Legal Notice & Corporate Impressum | GlobalCart Online Shop" },
      { name: "description", content: "Corporate registration, ACRA UEN, Tax ID, and legal representative info for GlobalCart International Pte. Ltd." },
      { property: "og:title", content: "Legal Notice | GlobalCart Online Shop" },
      { property: "og:description", content: "Official corporate impressum and legal disclosure for GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <LegalNotice />
    </MainLayout>
  ),
});
