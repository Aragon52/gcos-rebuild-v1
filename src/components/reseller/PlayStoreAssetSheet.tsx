import { useState } from "react";
import { Download, Copy, Check, Sparkles, Smartphone, Layers, Image as ImageIcon, ChevronRight, FileCode, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PlayStoreAssetSheet() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const metadata = {
    appName: "GCOS Reseller Portal",
    shortDescription: "Manage your online shop, orders, VIP profits and commissions on the go.",
    fullDescription: `GCOS Reseller Portal is the all-in-one mobile command center for digital store owners, e-commerce resellers, and dropshipping partners.

Key Features:
- 🚀 Zero Inventory Risk: Select verified high-demand catalog products with automated supplier fulfillment.
- 💎 Dynamic VIP Margin Tiers: Earn up to 40% profit margins with tiered VIP progression and reward structures.
- 📊 Real-time Analytics: Track your daily shop turnover, order states, store visits, and revenue streams live.
- ⚡ Instant Balance & Daily Payouts: Request rapid withdrawals directly to your crypto USDT wallet or bank account.
- 🔔 Real-Time Order Alerts: Instant push notifications whenever a new customer order or commission arrives.
- 🛠️ Store Customization: Personalize your storefront theme, custom banner, logo, and promotional discount campaigns.

Join thousands of global merchants scaling their online stores with GlobalCart OS.`,
    packageName: "com.globalcart_onlineshop.reseller.twa",
    category: "Shopping / Business",
    contentRating: "Everyone (PEGI 3 / ESRB Everyone)",
    privacyPolicy: "https://globalcart-onlineshop.com/reseller/privacy",
    supportEmail: "support@globalcart-onlineshop.com"
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 p-4 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-card-foreground">Google Play Store &amp; Brand Assets</p>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Ready
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Download icons, 1024x500 banner, logos &amp; store listing</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-t border-border bg-background p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <SheetTitle className="text-base font-bold text-foreground">
                Google Play Store Asset Pack
              </SheetTitle>
            </div>
            <a href="/playstore-assets.zip" download="playstore-assets.zip">
              <Button size="sm" className="gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm">
                <Download className="h-4 w-4" />
                Download All (.ZIP)
              </Button>
            </a>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Quick Summary Card */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Standard Production Package Generated</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All visual assets strictly meet Google Play Console, Android Launcher (mipmap mdpi-xxxhdpi), PWA Maskable, and vector logo specifications.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground font-mono">512x512 Hi-Res Icon</span>
              <span className="text-[11px] bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground font-mono">1024x500 Feature Graphic</span>
              <span className="text-[11px] bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground font-mono">Android Mipmaps (48-192px)</span>
              <span className="text-[11px] bg-muted px-2.5 py-1 rounded-lg border border-border text-foreground font-mono">Adaptive Vector FG/BG</span>
            </div>
          </div>

          {/* 1. Play Store Visual Previews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Store Listing Graphics Preview
              </h3>
            </div>

            {/* Feature Graphic Banner Preview */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
                <span className="text-xs font-semibold text-foreground">Play Store Feature Graphic (1024 x 500)</span>
                <a 
                  href="/playstore/store_listing/playstore-feature-graphic-1024x500.png" 
                  download="playstore-feature-graphic-1024x500.png"
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Save PNG
                </a>
              </div>
              <div className="p-3 bg-slate-950 flex items-center justify-center">
                <img 
                  src="/playstore/store_listing/playstore-feature-graphic-1024x500.png" 
                  alt="Play Store Feature Graphic" 
                  className="w-full h-auto rounded-lg shadow-md max-h-48 object-cover"
                />
              </div>
            </div>

            {/* Hi-Res Icon & Adaptive Previews */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-semibold text-foreground">Play Store Icon (512x512)</span>
                <img 
                  src="/playstore/store_listing/playstore-icon-512x512.png" 
                  alt="Play Store 512 Icon" 
                  className="h-24 w-24 rounded-2xl shadow-md border border-border"
                />
                <a 
                  href="/playstore/store_listing/playstore-icon-512x512.png" 
                  download="playstore-icon-512x512.png"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-auto"
                >
                  <Download className="h-3 w-3" /> Download Icon
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-semibold text-foreground">Adaptive Round Icon</span>
                <div className="h-24 w-24 rounded-full overflow-hidden shadow-md border border-border bg-slate-900 flex items-center justify-center">
                  <img 
                    src="/playstore/android/res/mipmap-xxxhdpi/ic_launcher_round.png" 
                    alt="Adaptive Round Launcher" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <a 
                  href="/playstore/android/res/mipmap-xxxhdpi/ic_launcher_round.png" 
                  download="ic_launcher_round.png"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-auto"
                >
                  <Download className="h-3 w-3" /> Download Round
                </a>
              </div>
            </div>
          </div>

          {/* 2. Logo Pack Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Logo Pack (Light &amp; Dark Lockups)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dark BG Logo */}
              <div className="rounded-2xl border border-border bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">Horizontal Logo (For Dark Themes)</span>
                  <a href="/playstore/logos/logo-horizontal-dark.svg" download="logo-horizontal-dark.svg" className="text-[11px] text-primary hover:underline">
                    SVG
                  </a>
                </div>
                <div className="h-16 flex items-center justify-center">
                  <img src="/playstore/logos/logo-horizontal-dark.svg" alt="Logo Dark" className="max-h-12 w-auto" />
                </div>
              </div>

              {/* Light BG Logo */}
              <div className="rounded-2xl border border-border bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">Horizontal Logo (For Light Themes)</span>
                  <a href="/playstore/logos/logo-horizontal-light.svg" download="logo-horizontal-light.svg" className="text-[11px] text-primary hover:underline">
                    SVG
                  </a>
                </div>
                <div className="h-16 flex items-center justify-center">
                  <img src="/playstore/logos/logo-horizontal-light.svg" alt="Logo Light" className="max-h-12 w-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Google Play Store Listing Copy & Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              Play Store Listing Metadata
            </h3>

            {/* App Title */}
            <div className="rounded-2xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">App Name (max 30 chars)</span>
                <button 
                  onClick={() => copyToClipboard(metadata.appName, "App Name")}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {copiedField === "App Name" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedField === "App Name" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm font-semibold text-foreground">{metadata.appName}</p>
            </div>

            {/* Short Description */}
            <div className="rounded-2xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Short Description (max 80 chars)</span>
                <button 
                  onClick={() => copyToClipboard(metadata.shortDescription, "Short Description")}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {copiedField === "Short Description" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedField === "Short Description" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-foreground">{metadata.shortDescription}</p>
            </div>

            {/* Full Description */}
            <div className="rounded-2xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Full Description (max 4000 chars)</span>
                <button 
                  onClick={() => copyToClipboard(metadata.fullDescription, "Full Description")}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {copiedField === "Full Description" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedField === "Full Description" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-4 hover:line-clamp-none transition-all">
                {metadata.fullDescription}
              </p>
            </div>

            {/* Package & TWA info */}
            <div className="rounded-2xl border border-border bg-card p-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground">Package Identifier</span>
                <p className="text-xs font-mono font-medium text-foreground truncate">{metadata.packageName}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">App Category</span>
                <p className="text-xs font-medium text-foreground">{metadata.category}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
