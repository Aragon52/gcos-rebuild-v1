import React from "react";

export default function ShippingPolicy() {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">GCOS customer information</p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Shipping Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 27, 2026</p>
      <div className="prose prose-slate max-w-none">
        <h2>1. Delivery coverage</h2>
        <p>GCOS connects customers with independent sellers and reseller stores. Delivery availability, estimated dates, and destinations are shown at checkout and may vary by seller, product, and destination.</p>
        <h2>2. Processing and dispatch</h2>
        <p>Orders are normally processed after payment is confirmed. Sellers may need additional time for made-to-order, customized, or regulated products. Your dispatch confirmation and tracking details will be sent to the email address on your account when available.</p>
        <h2>3. Delivery estimates</h2>
        <p>Delivery estimates are indicative and can be affected by customs clearance, weather, carrier disruptions, incorrect address details, or other events outside the seller&apos;s reasonable control. Please ensure that your delivery address and contact details are accurate before placing an order.</p>
        <h2>4. Customs, duties, and taxes</h2>
        <p>International orders may be subject to import duties, taxes, brokerage fees, or other charges imposed by the destination country. Unless stated otherwise at checkout, these charges are the customer&apos;s responsibility.</p>
        <h2>5. Missing or damaged deliveries</h2>
        <p>Contact support@globalcart-onlineshop.com promptly if a delivery is missing, arrives damaged, or does not match the order. Please include your order number and photographs where relevant so we can coordinate with the seller or carrier.</p>
        <h2>6. Contact</h2>
        <p>For shipping questions, contact support@globalcart-onlineshop.com with your order number and destination.</p>
      </div>
    </article>
  );
}
