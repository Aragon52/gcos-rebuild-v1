import { useState } from "react";
import { Gift, Sparkles, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { resellerPath } from "@/lib/subdomain";
import { useSeasonalTheme } from "@/lib/seasonal-theme-context-hooks";
import { getTemplate } from "@/lib/seasonal-campaigns";

/** Minimum deposit that qualifies for the bonus match, pre-filled on the deposit form. */
const BONUS_MIN_DEPOSIT = "100";

const DEFAULT_BANNER_CLASS =
  "bg-gradient-to-r from-amber-500/15 via-emerald-500/20 to-amber-500/15 dark:from-amber-900/30 dark:via-emerald-900/30 dark:to-amber-900/30 border-emerald-500/30";

export default function PromotionalBonusBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { campaign } = useSeasonalTheme();

  if (dismissed) return null;

  const seasonal =
    campaign && campaign.showOnReseller && campaign.bannerMessage.trim() ? campaign : null;
  const template = seasonal ? getTemplate(seasonal.template) : null;

  const handleBannerClick = () => {
    if (seasonal) {
      const target = seasonal.ctaPath?.trim() || "/reseller/profile";
      if (/^https?:\/\//i.test(target)) {
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      }
      void navigate({ to: resellerPath(target) as never });
      return;
    }
    void navigate({
      to: resellerPath("/reseller/profile") as never,
      search: { deposit: "1", amount: BONUS_MIN_DEPOSIT } as never,
    });
  };

  const bannerText = seasonal ? (
    <div
      className="flex items-center gap-3 px-6 cursor-pointer hover:opacity-95 transition-opacity"
      onClick={handleBannerClick}
    >
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-foreground/10 border border-foreground/15 shrink-0">
        <Sparkles className={`h-3 w-3 animate-pulse ${template?.accentClass ?? ""}`} />
        {seasonal.name}
      </span>
      <span className="font-semibold text-foreground text-xs sm:text-sm tracking-tight">
        {seasonal.bannerMessage}
      </span>
      {seasonal.ctaLabel.trim() && (
        <span className="inline-flex items-center text-[11px] font-bold text-primary hover:underline shrink-0 gap-0.5">
          {seasonal.ctaLabel}
        </span>
      )}
    </div>
  ) : (
    <div
      className="flex items-center gap-3 px-6 cursor-pointer hover:opacity-95 transition-opacity"
      onClick={handleBannerClick}
    >
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
        <Sparkles className="h-3 w-3 animate-pulse" />
        Deposit Bonus Match
      </span>
      <span className="font-semibold text-foreground text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
        <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 inline" />
        Resellers making a deposit over <strong className="text-emerald-600 dark:text-emerald-400 font-bold">$100 USD</strong> will receive an Exclusive Bonus of <strong className="text-amber-600 dark:text-amber-400 font-bold">$10-$100</strong> according to the market activities and credibility!
      </span>
      <span className="inline-flex items-center text-[11px] font-bold text-primary hover:underline shrink-0 gap-0.5">
        Deposit Now ==&gt;
      </span>
    </div>
  );

  return (
    <div
      className={`relative w-full border-b py-1.5 overflow-hidden select-none z-30 ${
        template?.bannerClass ?? DEFAULT_BANNER_CLASS
      }`}
    >
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee-infinite flex items-center">
          {bannerText}
          <span className="mx-8 text-muted-foreground/40 font-bold">●</span>
          {bannerText}
          <span className="mx-8 text-muted-foreground/40 font-bold">●</span>
          {bannerText}
          <span className="mx-8 text-muted-foreground/40 font-bold">●</span>
          {bannerText}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/60 hover:bg-background text-muted-foreground hover:text-foreground transition-colors z-40 border border-border shadow-xs"
        title="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
