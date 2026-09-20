import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import AboutUs from "@/pages/AboutUs";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | GlobalCart Online Shop" },
      { name: "description", content: "Corporate profile, registration credentials, and security standards for GlobalCart International Pte. Ltd." },
      { property: "og:title", content: "About Us | GlobalCart Online Shop" },
      { property: "og:description", content: "Learn about GlobalCart International Pte. Ltd. (GCOS) and our verified marketplace standards." },
    ],
  }),
  component: () => (
    <MainLayout>
      <AboutUs />
    </MainLayout>
  ),
});
