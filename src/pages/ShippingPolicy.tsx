import React from "react";
import SEO from "@/components/SEO";
import { Truck, Globe, Clock, ShieldCheck, Briefcase, Mail } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Shipping & Delivery Policy - Demo Project Disclosure - GlobalCart"
        description="Review shipping coverage, international dispatch guidelines, logistics tracking integrations, and demo project notices for GlobalCart."
        canonical="https://globalcart-onlineshop.com/shipping-policy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Shipping Policy", item: "/shipping-policy" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Logistics, Fulfillment &amp; Operations</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Shipping &amp; Delivery Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 24, 2026</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Demonstration Pilot &amp; Logistics Workflow Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This platform operates as a <strong>demonstration project and technology pilot</strong> designed to showcase a complete headless e-commerce architecture and real-time logistics synchronization line-ups to business investors and commercial partners.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Simulated Fulfillment &amp; Tracking:</strong> Tracking numbers, carrier integrations (DHL, FedEx, UPS), and delivery updates demonstrate our real-time telemetry pipelines and do not represent physical freight movements during this demo pilot phase.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Global Delivery Coverage &amp; Carrier Routing</h2>
            <p className="text-muted-foreground">
              GlobalCart features multi-warehouse routing and international carrier integration covering over 100 countries across North America, Europe, Asia-Pacific, and Latin America.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Processing, Dispatch &amp; SLA Tracking</h2>
            <p className="text-muted-foreground text-xs">
              Orders are automatically dispatched to the nearest fulfillment hub or verified reseller node. Merchant performance is governed by strict SLA thresholds ensuring prompt handling and dispatch within 24–48 hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Real-Time Tracking &amp; Notifications</h2>
            <p className="text-muted-foreground text-xs">
              Customers receive instant updates via automated email notifications and the customer dashboard as shipments progress through customs clearance, regional sorting, and final-mile delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Inquiries &amp; Investor Contact</h2>
            <p className="text-muted-foreground text-xs">
              For logistics partnership inquiries or investor discussions, contact us at <span className="text-primary font-semibold">support@globalcart-onlineshop.com</span> or <span className="text-primary font-semibold">investors@globalcart-onlineshop.com</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
