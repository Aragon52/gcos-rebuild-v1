import React from "react";
import SEO from "@/components/SEO";
import { Building2, Scale, ShieldCheck, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function LegalNotice() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Legal Notice & Corporate Impressum - GlobalCart"
        description="Official legal disclosures, corporate registration, tax identification, and regulatory information for GlobalCart International Pte. Ltd."
        canonical="https://globalcart-onlineshop.com/legal"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Legal Notice", item: "/legal" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Corporate Transparency</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Legal Notice &amp; Impressum</h1>
          <p className="text-xs text-muted-foreground">Statutory company information pursuant to international e-commerce regulations.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Identification
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
              <span className="text-muted-foreground block mb-1">Nature of Business:</span>
              <span className="font-semibold text-foreground">E-Commerce &amp; Multi-Vendor Digital Marketplace</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Registered Corporate Address &amp; Contact
          </h2>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Headquarters:</strong> 30 Cecil Street #21-05, Prudential Tower, Singapore 048716</p>
            <p><strong className="text-foreground">Support Telephone:</strong> +65 6800 4200</p>
            <p><strong className="text-foreground">General Enquiries:</strong> support@globalcart-onlineshop.com</p>
            <p><strong className="text-foreground">Legal &amp; Compliance:</strong> legal@globalcart-onlineshop.com</p>
            <p><strong className="text-foreground">Website:</strong> https://globalcart-onlineshop.com</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Online Dispute Resolution (ODR)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In accordance with international consumer arbitration principles, consumers have the option to contact the relevant consumer mediation bodies or resolve complaints directly through our dedicated dispute desk at <span className="text-primary font-semibold">compliance@globalcart-onlineshop.com</span>.
          </p>
        </div>
      </article>
    </div>
  );
}
