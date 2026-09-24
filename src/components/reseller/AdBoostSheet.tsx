import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Headphones, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "@/lib/router-compat";
import { resellerPath } from "@/lib/subdomain";

import launchpadImg from "@/assets/images/ad_boost_launchpad_1790261573742.jpg";
import momentumImg from "@/assets/images/ad_boost_momentum_1790261589870.jpg";
import primeImg from "@/assets/images/ad_boost_prime_1790261601919.jpg";

interface AdBoostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan?: string | null;
}

export default function AdBoostSheet({ open, onOpenChange, initialPlan }: AdBoostSheetProps) {
  const [selected, setSelected] = useState<string | null>(initialPlan || "Momentum Boost");
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Keep selected in sync with initialPlan when opening
  useEffect(() => {
    if (open && initialPlan) {
      setSelected(initialPlan);
    }
  }, [open, initialPlan]);

  const plans = [
    {
      name: t("reseller.launchPad", { defaultValue: "LaunchPad" }),
      visitors: "10-50",
      description: t("reseller.tenBillionFlow", { defaultValue: "Accelerate initial traffic and customer engagement for early sales momentum." }),
      price: "$100",
      duration: `7 ${t("reseller.days", { defaultValue: "days" })}`,
      image: launchpadImg,
      accent: "from-emerald-500/[0.10] to-emerald-500/[0.03]",
      tag: "Starter",
      tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      name: t("reseller.momentumBoost", { defaultValue: "Momentum Boost" }),
      visitors: "50-100",
      description: t("reseller.tenBillionFlow", { defaultValue: "Recommended for steady customer conversion and top algorithmic placement." }),
      price: "$200",
      duration: `15 ${t("reseller.days", { defaultValue: "days" })}`,
      image: momentumImg,
      accent: "from-primary/[0.14] to-primary/[0.05]",
      tag: "Most Popular",
      tagClass: "bg-primary text-primary-foreground font-bold shadow-sm",
    },
    {
      name: t("reseller.primeVisibility", { defaultValue: "Prime Visibility" }),
      visitors: "100-1000",
      description: t("reseller.tenBillionFlow", { defaultValue: "Maximum priority traffic exposure with dedicated marketing SLA and priority routing." }),
      price: "$500",
      duration: `30 ${t("reseller.days", { defaultValue: "days" })}`,
      image: primeImg,
      accent: "from-purple-500/[0.12] to-purple-500/[0.04]",
      tag: "VIP Max",
      tagClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ] as const;

  const handleSubscribe = () => {
    if (!selected) return;
    toast({
      title: "Ad Boosting Activated",
      description: `Your application for ${selected} has been registered. Connecting to campaign manager...`,
    });
    onOpenChange(false);
    navigate(resellerPath("/reseller/messages"), { state: { tab: "support" } });
  };

  const handleContactExpert = () => {
    onOpenChange(false);
    navigate(resellerPath("/reseller/messages"), { state: { tab: "support" } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto px-4 pb-8">
        <SheetHeader className="px-0 pt-2 pb-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base sm:text-lg font-bold text-foreground">
              {t("reseller.adBoostingPlans", { defaultValue: "Store Ad Boosting Plans" })}
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("reseller.choosePlanBoostVisibility", {
              defaultValue: "Choose a targeted ad boosting plan to accelerate your store visibility and daily orders.",
            })}
          </p>
        </SheetHeader>

        <div className="space-y-3 mt-2">
          {plans.map((plan) => {
            const isSelected = selected === plan.name;
            return (
              <button
                key={plan.name}
                type="button"
                onClick={() => setSelected(plan.name)}
                className={`w-full text-left relative rounded-2xl overflow-hidden border p-3.5 sm:p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-primary shadow-[0_0_20px_rgba(0,144,0,0.15)] ring-1 ring-primary/40 bg-card"
                    : "border-primary/15 hover:border-primary/30 bg-muted/15"
                }`}
              >
                {/* Glass background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.accent} backdrop-blur-sm pointer-events-none`} />
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/[0.06] pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-primary/[0.04] pointer-events-none" />

                <div className="relative z-10 flex items-start gap-3.5">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted/40 border border-white/10 flex-shrink-0 shadow-sm">
                    <img 
                      src={plan.image} 
                      alt={plan.name} 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${plan.tagClass}`}>
                          {plan.tag}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-primary font-semibold mt-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{t("reseller.dailyVisitorVolume", { defaultValue: "Daily Visitors" })}: {plan.visitors}</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mt-2.5">
                      <span className="text-base font-extrabold text-foreground">{plan.price}</span>
                      <span className="text-[10px] text-muted-foreground">/ {plan.duration}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleSubscribe}
          className="w-full mt-5 rounded-xl h-11 text-sm font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          disabled={!selected}
        >
          <Rocket className="h-4 w-4 mr-2" />
          {t("reseller.subscribeTo", { defaultValue: "Subscribe to" })} {selected || t("reseller.aPlan", { defaultValue: "a Plan" })}
        </Button>

        {/* Custom plan card */}
        <div className="mt-4 relative rounded-2xl overflow-hidden border border-primary/15 p-4 sm:p-5 text-center bg-card/60">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] backdrop-blur-sm" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/[0.06]" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-foreground">{t("reseller.flexiblePlan", { defaultValue: "Custom Tailored Campaign" })}</h3>
            <p className="text-xs font-semibold text-primary mt-0.5">{t("reseller.reliableProductJustForYou", { defaultValue: "Enterprise & Tailored Traffic Plans" })}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed max-w-md mx-auto">
              {t("reseller.comeWithDesirePlan", { defaultValue: "Need higher volume or bespoke targeting? Chat with our dedicated growth managers." })}
            </p>
            <Button 
              type="button"
              onClick={handleContactExpert}
              variant="outline" 
              className="mt-3 rounded-xl h-9 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
            >
              <Headphones className="h-3.5 w-3.5" />
              {t("reseller.talkWithMarketingExperts", { defaultValue: "Talk with Marketing Experts" })}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
