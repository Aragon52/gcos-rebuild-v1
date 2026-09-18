import React from 'react';
import { ShieldCheck, Truck, Headset, CreditCard } from 'lucide-react';

export function TrustSection() {
  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Secure Shopping",
      description: "Review our privacy policy and account controls before you shop."
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Global Shipping",
      description: "Delivery options and availability are shown for each order."
    },
    {
      icon: <Headset className="h-8 w-8 text-primary" />,
      title: "24/7 Support",
      description: "Find help and contact options through our support pages."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Safe Payments",
      description: "Available payment methods are shown securely at checkout."
    }
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="mb-4 p-3 bg-background rounded-full shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
