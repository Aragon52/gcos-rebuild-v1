import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, Zap, Target, BarChart, Plus, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import launchpadImg from "@/assets/images/ad_boost_launchpad_1790261573742.jpg";
import momentumImg from "@/assets/images/ad_boost_momentum_1790261589870.jpg";
import primeImg from "@/assets/images/ad_boost_prime_1790261601919.jpg";

export default function AdBoostService() {
  const { t } = useTranslation();

  const plans = [
    { 
      name: "LaunchPad Starter", 
      price: "$100", 
      duration: "7 days",
      visitors: "10-50 daily visitors",
      features: ["1 Featured Product Placement", "Basic Flow Acceleration", "Standard Reseller Support", "Real-Time Impression Counter"],
      image: launchpadImg,
      popular: false
    },
    { 
      name: "Momentum Boost", 
      price: "$200", 
      duration: "15 days",
      visitors: "50-100 daily visitors",
      features: ["5 Featured Store Products", "Smart Category Priority", "Priority Reseller Support", "Bi-Weekly Traffic Reports"],
      image: momentumImg,
      popular: true
    },
    { 
      name: "Prime Visibility", 
      price: "$500", 
      duration: "30 days",
      visitors: "100-1,000 daily visitors",
      features: ["Unlimited Featured Showcase", "Top-Banner Placement", "Dedicated Account Manager", "Live Conversion Analytics"],
      image: primeImg,
      popular: false
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("reseller.adBoostService", { defaultValue: "AD Boosting Plans & Traffic Acceleration" })}</h1>
        <p className="text-sm text-muted-foreground">{t("reseller.accelerateSalesDesc", { defaultValue: "Scale your store traffic and reach thousands of verified buyers worldwide." })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`border border-border/80 shadow-theme-lg flex flex-col relative overflow-hidden bg-card/60 backdrop-blur-sm ${plan.popular ? "ring-2 ring-primary shadow-primary/10" : ""}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
                {t("reseller.mostPopular", { defaultValue: "Most Popular" })}
              </div>
            )}
            
            <div className="p-4 pt-6 flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-2xl overflow-hidden shadow-md border border-white/10 mb-4 bg-muted/40">
                <img src={plan.image} alt={plan.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="mt-1 text-xs font-semibold text-primary">
                {plan.visitors}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">/ {plan.duration}</span>
              </div>
            </div>

            <CardContent className="flex-1 pt-2">
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <div className="p-6 pt-2">
              <Button className="w-full font-bold h-11 rounded-xl" variant={plan.popular ? "default" : "outline"}>
                {t("reseller.choose", { defaultValue: "Select" })} {plan.name}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-theme-sm bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t("reseller.trackPerformance", { defaultValue: "Real-Time Traffic & Conversion Telemetry" })}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reseller.analyticsDashboardDesc", { defaultValue: "Monitor live impression peaks, store conversion metrics, and buyer engagement across all boost campaigns." })}
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 rounded-xl">{t("reseller.viewSampleReport", { defaultValue: "View Sample Report" })}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
