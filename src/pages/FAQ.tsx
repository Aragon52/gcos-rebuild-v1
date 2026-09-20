import React from "react";
import SEO from "@/components/SEO";
import { 
  HelpCircle, ShieldCheck, Truck, RefreshCw, Lock, CreditCard, 
  CheckCircle2, Mail, Phone 
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      q: "Is GlobalCart Online Shop a legitimate and verified e-commerce marketplace?",
      a: "Yes. GlobalCart Online Shop is an officially registered marketplace operated by GlobalCart International Pte. Ltd. (ACRA UEN: 202301984M). All transactions are backed by 100% Buyer Protection, SSL 256-bit encryption, and PCI-DSS Level 1 secure payment processing.",
    },
    {
      q: "How does the Buyer Protection Guarantee work?",
      a: "Under our Buyer Protection Guarantee, merchant payouts are safeguarded in escrow until you receive and verify your ordered items. If an item is not delivered within the guaranteed timeframe, arrives damaged, or does not match the product listing, you are entitled to an immediate replacement or full refund.",
    },
    {
      q: "How can I track my order shipment?",
      a: "Once your order is processed and dispatched by our logistics network, you will receive an email confirmation with an official carrier tracking link (e.g. DHL, FedEx, UPS). You can also track your order anytime directly in your Customer Account dashboard under 'My Orders'.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept Visa, MasterCard, American Express, Apple Pay, Google Pay, direct bank transfers (SEPA/Wire), and secure cryptocurrency payments (USDT TRC20/ERC20, Bitcoin, ETH). All card numbers are tokenized and never stored on our servers.",
    },
    {
      q: "What is your return and refund timeframe?",
      a: "We offer a 14-day return window starting from the day your parcel is marked as delivered. If an item is defective or incorrect, return shipping costs are covered by the seller or platform.",
    },
    {
      q: "How do I contact customer support if I need help?",
      a: "Our customer service and compliance team is available 24/7/365. You can email support@globalcart-onlineshop.com, call +65 6800 4200, or submit a support ticket via our Contact Us page.",
    },
    {
      q: "Are merchant and reseller storefronts verified before listing goods?",
      a: "Yes. Every seller and reseller on our platform undergoes Know-Your-Customer (KYC) identity vetting, inventory verification, and must maintain strict Service Level Agreements (SLAs) regarding order fulfillment and customer response times.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Frequently Asked Questions (FAQ) & Trust Center - GlobalCart"
        description="Find answers to common questions regarding GlobalCart order tracking, payment security, buyer protection, return policies, and seller verification."
        canonical="https://globalcart-onlineshop.com/faq"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "FAQ", item: "/faq" },
        ]}
      />

      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Trust &amp; Help Center</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Clear answers about our buyer protection policies, shipping timelines, and payment security standards.
        </p>
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
          <h3 className="font-bold text-sm text-foreground">Still have questions?</h3>
          <p className="text-xs text-muted-foreground">Our 24/7 customer care team is ready to assist you.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/contact">
              <Mail className="h-4 w-4 mr-2" /> Contact Us
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/verification-compliance">
              <ShieldCheck className="h-4 w-4 mr-2" /> Trust &amp; Safety
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
