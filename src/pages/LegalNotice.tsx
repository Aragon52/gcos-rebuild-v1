import React from "react";
import SEO from "@/components/SEO";
import { Building2, Scale, ShieldCheck, Mail, Phone, MapPin, Globe, Briefcase } from "lucide-react";

export default function LegalNotice() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Legal Notice & Demo Project Disclosure - GlobalCart"
        description="Official legal disclosures, corporate identification, demonstration project scope, and investor presentation terms for GlobalCart International Pte. Ltd."
        canonical="https://globalcart-onlineshop.com/legal"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Legal Notice", item: "/legal" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Corporate Transparency &amp; Pilot Disclosure</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Legal Notice &amp; Impressum</h1>
          <p className="text-xs text-muted-foreground">Statutory company information, demo architecture disclosures, and investor relations information.</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Demonstration Pilot &amp; Investor Showcase Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This deployment is an advanced <strong>demonstration pilot project</strong> crafted to showcase a complete, fully operating headless e-commerce application architecture and operations line-ups for <strong>introducing the technology and seeking business investors</strong>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Non-Financial Statement:</strong> Interacting with this application does not entail real financial deals, live monetary charges, or retail consumer transactions. All operations and records represent functional technology demonstrations.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Corporate Entity Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Company Name:</span>
              <span className="font-bold text-foreground text-sm">GlobalCart International Pte. Ltd.</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">ACRA Unique Entity Number (UEN):</span>
              <span className="font-mono font-bold text-foreground text-sm">202301984M</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Tax / GST Identification Number:</span>
              <span className="font-mono font-bold text-foreground text-sm">SG202301984M</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Project Nature:</span>
              <span className="font-semibold text-foreground">Headless E-Commerce Technology Pilot &amp; Investor Showcase</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Corporate Headquarters &amp; Investor Desk
          </h2>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Headquarters:</strong> 30 Cecil Street #21-05, Prudential Tower, Singapore 048716</p>
            <p><strong className="text-foreground">Support &amp; Telephone:</strong> +65 6800 4200</p>
            <p><strong className="text-foreground">Investor Relations:</strong> investors@globalcart-onlineshop.com</p>
            <p><strong className="text-foreground">Legal &amp; Compliance:</strong> legal@globalcart-onlineshop.com</p>
            <p><strong className="text-foreground">Website:</strong> https://globalcart-onlineshop.com</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Legal Notice &amp; Dispute Inquiries
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All inquiries regarding corporate licensing, investment opportunities, or regulatory inquiries may be directed to our compliance and legal team at <span className="text-primary font-semibold">compliance@globalcart-onlineshop.com</span>.
          </p>
        </div>
      </article>
    </div>
  );
}
