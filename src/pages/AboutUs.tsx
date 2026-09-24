import React from "react";
import SEO from "@/components/SEO";
import { 
  Building2, ShieldCheck, Globe, Users, Award, Lock, CheckCircle2, 
  Truck, Clock, FileText, Phone, Mail, MapPin, ExternalLink, Sparkles, Briefcase 
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <SEO
        title="About Us - Corporate Identity, Security & Headless Demo Project"
        description="Learn about GlobalCart International Pte. Ltd. (GCOS). An advanced headless e-commerce technology pilot and investor presentation environment showcasing multi-merchant capabilities."
        canonical="https://globalcart-onlineshop.com/about"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "About Us", item: "/about" },
        ]}
      />

      {/* Hero Header */}
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-primary border-primary/30 bg-primary/5 uppercase tracking-wider">
          Technology Pilot &amp; Corporate Profile
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          About GlobalCart Online Shop
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Operating under <strong className="text-foreground">GlobalCart International Pte. Ltd.</strong>, GCOS demonstrates a complete headless e-commerce application architecture, multi-merchant reseller engine, and synchronized operations line-ups.
        </p>
      </div>

      {/* Demo Project & Investor Showcase Notice */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3 mb-12">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Briefcase className="h-5 w-5 flex-shrink-0" />
          <span>Demonstration Project &amp; Investor Presentation Notice</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This platform is engineered as a comprehensive <strong>demonstration pilot</strong> to introduce and showcase our end-to-end headless e-commerce stack and operational workflows to <strong>prospective business investors, strategic partners, and technology evaluators</strong>.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Simulated Commercial Environment:</strong> All catalogs, inventory items, orders, reseller store setups, and payment flows within this environment are functioning for simulation and architecture demonstration purposes. <strong>There are no real financial transactions, live consumer credit debits, or commercial financial liabilities</strong> executed while using or evaluating this demo app.
        </p>
      </div>

      {/* Trust & Verification Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1">
          <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto" />
          <div className="text-xs font-bold text-foreground">Verified Merchant Network</div>
          <div className="text-[11px] text-muted-foreground">100% KYC &amp; Merchant Vetting</div>
        </div>
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center space-y-1">
          <Lock className="h-6 w-6 text-blue-600 mx-auto" />
          <div className="text-xs font-bold text-foreground">256-Bit SSL Encryption</div>
          <div className="text-[11px] text-muted-foreground">PCI-DSS Level 1 Compliant Architecture</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center space-y-1">
          <Award className="h-6 w-6 text-amber-600 mx-auto" />
          <div className="text-xs font-bold text-foreground">Buyer Protection Escrow</div>
          <div className="text-[11px] text-muted-foreground">Integrated Escrow Settlement Logic</div>
        </div>
        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center space-y-1">
          <Clock className="h-6 w-6 text-purple-600 mx-auto" />
          <div className="text-xs font-bold text-foreground">Operational Line-ups</div>
          <div className="text-[11px] text-muted-foreground">ARS, ACH &amp; SLA Management</div>
        </div>
      </div>

      {/* Company Mission & Operational Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Our Core Architecture &amp; Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded to advance headless commerce standards, GlobalCart connects quality product suppliers, vetted reseller entrepreneurs, and end consumers through a high-performance, modular application framework.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every transaction is safeguarded by escrow-based fulfillment standards: funds are held until the customer receives and verifies the ordered products according to stated specifications.
          </p>
          <ul className="space-y-2 pt-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Modular headless APIs connecting catalog, inventory, and checkout</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Full compliance with GDPR, CCPA, and international consumer privacy</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Automated partner payouts (ARS) and clearing house governance (ACH)</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Corporate Registration &amp; Identity
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Legal Entity:</span>
              <span className="font-semibold text-foreground">GlobalCart International Pte. Ltd.</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">ACRA Registration (UEN):</span>
              <span className="font-mono font-semibold text-foreground">202301984M</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Tax / GST Number:</span>
              <span className="font-mono font-semibold text-foreground">SG202301984M</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Headquarters:</span>
              <span className="font-semibold text-foreground text-right">30 Cecil Street #21-05, Singapore 048716</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Investor Relations:</span>
              <span className="font-semibold text-primary">investors@globalcart-onlineshop.com</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Customer Support Hotline:</span>
              <span className="font-semibold text-foreground">+65 6800 4200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Buyer Protection Pillars */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Ecosystem &amp; Operational Governance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Vetted Merchant Governance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Resellers complete identity verification (KYC), store ownership review, and maintain SLA fulfillment compliance to list goods on the platform.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">End-to-End Tracked Delivery</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Simulated telemetry pipelines with official courier tracking (DHL, FedEx, UPS, EMS) allowing real-time milestone updates from warehouse to doorstep.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Fair Refund Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an item is damaged, defective, or not received within the guaranteed delivery timeframe, buyers are eligible for an immediate full refund or replacement.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Call-To-Action Banner */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">Interested in Investment or Strategic Partnership?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are actively introducing this headless e-commerce technology and seeking business investors. Contact our investor desk to schedule a technical walkthrough.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/contact">
              <Mail className="h-4 w-4 mr-2" /> Contact Investor Desk
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link to="/verification-compliance">
              <ShieldCheck className="h-4 w-4 mr-2" /> View Compliance
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
