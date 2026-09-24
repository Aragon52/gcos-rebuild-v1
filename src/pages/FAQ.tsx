import React from "react";
import SEO from "@/components/SEO";
import { 
  HelpCircle, ShieldCheck, Truck, RefreshCw, Lock, CreditCard, 
  CheckCircle2, Mail, Phone, Briefcase 
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      q: "What is the purpose of this GlobalCart Online Shop (GCOS) application?",
      a: "This entire environment is developed and maintained as a comprehensive demonstration project and technology pilot. Its core purpose is to introduce and showcase a complete, fully operating headless e-commerce application architecture, multi-merchant reseller engine, and synchronized operations line-ups (such as ARS, ACH, and SLA governance) to prospective business partners and investors.",
    },
    {
      q: "Are real financial transactions or commercial charges processed on this platform?",
      a: "No. This environment is an operational demo and pilot showcase. There are NO real financial transactions, live credit card charges, or binding financial deals executed while dealing with or evaluating this application. All payment methods, checkout sequences, and wallet balance settlements operate in sandbox and simulation modes for technology demonstration purposes.",
    },
    {
      q: "Who is behind this demonstration project?",
      a: "The project is architected and presented by GlobalCart International Pte. Ltd. (ACRA UEN: 202301984M), established in Singapore, showcasing advanced headless commerce, multi-vendor marketplace engineering, and automated administrative consoles.",
    },
    {
      q: "How does the demonstrated Buyer Protection Guarantee operate?",
      a: "Under our Buyer Protection model, simulated merchant payouts are safeguarded in an automated escrow pipeline until the simulated delivery is confirmed. If an item is delayed, defective, or inconsistent with listing specifications, automated refund or replacement workflows are triggered.",
    },
    {
      q: "How are logistics and delivery tracking simulated?",
      a: "The platform integrates with standardized webhook models and carrier tracking APIs (DHL, FedEx, UPS). Real-time tracking IDs and milestone events demonstrate live shipment telemetry from warehouse dispatch to doorstep delivery.",
    },
    {
      q: "How can prospective investors or strategic partners get in touch?",
      a: "We welcome discussions with prospective investors, commercial partners, and technology licensing evaluators. You can reach out directly via investors@globalcart-onlineshop.com or through our Contact page.",
    },
    {
      q: "How does the reseller and merchant onboarding module work?",
      a: "The application features self-service partner onboarding, store customization, catalog syndication, and profit-sharing models (ARS), allowing verified entrepreneurs to run independent branded storefronts powered by the central headless engine.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Frequently Asked Questions (FAQ) & Investor FAQ - GlobalCart"
        description="Find answers regarding GlobalCart's headless architecture, demonstration pilot scope, investor presentation details, and platform security."
        canonical="https://globalcart-onlineshop.com/faq"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "FAQ", item: "/faq" },
        ]}
      />

      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Trust &amp; Help Center</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Architecture overview, demo project scope, investor relations, and operational capabilities.
        </p>
      </div>

      {/* Demo Project Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-8 flex items-start gap-3 text-xs text-muted-foreground">
        <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Demo &amp; Investor Showcase Notice:</strong> This platform is a fully functional demonstration environment designed for seeking business investors and showcasing complete headless e-commerce operations. No real financial deals are processed.
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm mb-12">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border pb-2">
              <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline py-3">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-bold text-sm text-foreground">Seeking Business Investment Details?</h3>
          <p className="text-xs text-muted-foreground">Our team is available to discuss partnerships and platform licensing.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/contact">
              <Mail className="h-4 w-4 mr-2" /> Contact Investor Desk
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/about">
              <Briefcase className="h-4 w-4 mr-2" /> About the Project
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
