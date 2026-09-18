import { useState, useRef, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useReseller, type StoreTheme } from "@/lib/reseller-context-hooks";
import { toast } from "sonner";
import { compressImageToBase64 } from "@/lib/storage-utils";
import { getStorefrontUrl, resellerPath } from "@/lib/subdomain";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Palette,
  Store,
  ArrowLeft,
  Check,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const PRESET_BANNERS = [
  {
    name: "Midnight Modern",
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Luxury Minimal",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Cyber Neon",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Warm Boutique",
    url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Nordic Clean",
    url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80",
  },
];

const PRESET_LOGOS = [
  "https://api.dicebear.com/7.x/shapes/svg?seed=StoreElite&backgroundColor=0284c7",
  "https://api.dicebear.com/7.x/shapes/svg?seed=ProShop&backgroundColor=7c3aed",
  "https://api.dicebear.com/7.x/shapes/svg?seed=GcosMall&backgroundColor=059669",
  "https://api.dicebear.com/7.x/shapes/svg?seed=ApexGlobal&backgroundColor=ea580c",
  "https://api.dicebear.com/7.x/shapes/svg?seed=PrimeDeals&backgroundColor=db2777",
];

export default function ResellerShopCustomization() {
  const { reseller, updateProfile } = useReseller();
  const { t } = useTranslation();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const THEMES: { id: StoreTheme; name: string; description: string; preview: string }[] = [
    {
      id: "minimal",
      name: t("reseller.minimalTheme", { defaultValue: "Minimal Clean" }),
      description: t("reseller.minimalThemeDesc", { defaultValue: "Clean white background with modern typography" }),
      preview: "bg-background border-2 border-border",
    },
    {
      id: "bold",
      name: t("reseller.boldTheme", { defaultValue: "Bold Dark" }),
      description: t("reseller.boldThemeDesc", { defaultValue: "High contrast dark theme with bold styling" }),
      preview: "bg-slate-900 border-2 border-slate-700",
    },
    {
      id: "elegant",
      name: t("reseller.elegantTheme", { defaultValue: "Elegant Luxury" }),
      description: t("reseller.elegantThemeDesc", { defaultValue: "Refined gradients and serif typography" }),
      preview: "bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-2 border-amber-500/30",
    },
    {
      id: "vibrant",
      name: t("reseller.vibrantTheme", { defaultValue: "Vibrant Energy" }),
      description: t("reseller.vibrantThemeDesc", { defaultValue: "Lively colorful gradient accents" }),
      preview: "bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-indigo-400",
    },
  ];

  const [shopName, setShopName] = useState(reseller?.shopName || "");
  const [logoPreview, setLogoPreview] = useState(reseller?.shopLogo || "");
  const [bannerPreview, setBannerPreview] = useState(reseller?.shopHeroBanner || "");
  const [selectedTheme, setSelectedTheme] = useState<StoreTheme>(reseller?.storeTheme || "minimal");
  const [isSaving, setIsSaving] = useState(false);

  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [bannerUrlInput, setBannerUrlInput] = useState("");

  useEffect(() => {
    if (reseller) {
      setShopName(reseller.shopName || "");
      setLogoPreview(reseller.shopLogo || "");
      setBannerPreview(reseller.shopHeroBanner || "");
      setSelectedTheme(reseller.storeTheme || "minimal");
    }
  }, [reseller]);

  if (!reseller) return null;

  const processLogoFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("common.fileTooLarge", { defaultValue: "File is too large" }), {
        description: t("common.imageUnder5MB", { defaultValue: "Please choose an image under 5MB" }),
      });
      return;
    }
    const compressed = await compressImageToBase64(file, 600);
    if (compressed) {
      setLogoPreview(compressed);
      toast.success(t("reseller.logoSelected", { defaultValue: "Logo selected" }));
    } else {
      toast.error(t("common.error", { defaultValue: "Error" }), {
        description: t("common.failedToProcessImage", { defaultValue: "Failed to process image" }),
      });
    }
  };

  const processBannerFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("common.fileTooLarge", { defaultValue: "File is too large" }), {
        description: t("common.imageUnder10MB", { defaultValue: "Please choose an image under 10MB" }),
      });
      return;
    }
    const compressed = await compressImageToBase64(file, 1200);
    if (compressed) {
      setBannerPreview(compressed);
      toast.success(t("reseller.bannerSelected", { defaultValue: "Banner selected" }));
    } else {
      toast.error(t("common.error", { defaultValue: "Error" }), {
        description: t("common.failedToProcessImage", { defaultValue: "Failed to process image" }),
      });
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const applyLogoUrl = () => {
    if (!logoUrlInput.trim()) return;
    setLogoPreview(logoUrlInput.trim());
    setLogoUrlInput("");
    toast.success(t("reseller.logoSelected", { defaultValue: "Logo URL applied" }));
  };

  const applyBannerUrl = () => {
    if (!bannerUrlInput.trim()) return;
    setBannerPreview(bannerUrlInput.trim());
    setBannerUrlInput("");
    toast.success(t("reseller.bannerSelected", { defaultValue: "Banner URL applied" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        shopName: shopName.trim() || reseller.shopName,
        shopLogo: logoPreview,
        shopHeroBanner: bannerPreview,
        storeTheme: selectedTheme,
      });
      toast.success(t("reseller.shopUpdated", { defaultValue: "Shop decoration saved" }), {
        description: t("reseller.shopUpdatedDesc", { defaultValue: "Your store appearance has been successfully updated!" }),
      });
    } catch (e) {
      console.error("Shop customization save error:", e);
      toast.error(t("reseller.saveFailed", { defaultValue: "Save failed" }), {
        description: t("reseller.saveFailedDesc", { defaultValue: "Could not save your changes. Please try again." }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto pb-28">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={resellerPath("/reseller/profile")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("reseller.backToProfile", { defaultValue: "Back to Profile" })}
        </Link>
        <a
          href={getStorefrontUrl(reseller.shopSlug || "")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          <Store className="h-3.5 w-3.5" />
          <span>{t("reseller.viewStorefront", { defaultValue: "Live Store" })}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("reseller.decorateYourStore", { defaultValue: "Shop Decoration" })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("reseller.decorateYourStoreDesc", {
            defaultValue: "Customize your shop branding, logo, header banner, and visual theme.",
          })}
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" /> Live Storefront Preview
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize font-medium">
            Theme: {selectedTheme}
          </span>
        </div>

        {/* Mock Store Header */}
        <div className="relative rounded-xl overflow-hidden border border-border/80 bg-background shadow-inner">
          {/* Banner Area */}
          <div className="h-32 w-full relative bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Shop Banner"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-xs text-white/50 flex items-center gap-2 font-medium">
                <ImageIcon className="h-4 w-4" /> Default Header Banner
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          </div>

          {/* Store Info Bar */}
          <div className="px-4 pb-3 pt-2 flex items-center gap-3 bg-card">
            <div className="-mt-7 relative h-14 w-14 rounded-xl border-2 border-card bg-background shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Shop Logo"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-card-foreground truncate">
                {shopName || "My Reseller Store"}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {getStorefrontUrl(reseller.shopSlug || "my-shop")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Name Section */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("reseller.shopName", { defaultValue: "Shop Display Name" })}
          </h2>
        </div>
        <input
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          placeholder={t("reseller.shopNamePlaceholder", { defaultValue: "Enter your shop name" })}
        />
      </section>

      {/* Shop Logo Section */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {t("reseller.shopLogo", { defaultValue: "Shop Logo" })}
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setLogoMode("upload")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                logoMode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setLogoMode("url")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                logoMode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Image URL
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Logo Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingLogo(true);
            }}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDrop={handleLogoDrop}
            onClick={() => logoInputRef.current?.click()}
            className={`relative flex items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden flex-shrink-0 group ${
              isDraggingLogo
                ? "border-primary bg-primary/10 ring-4 ring-primary/20"
                : "border-border bg-muted/40 hover:border-primary/50"
            }`}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
                <Upload className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium leading-tight">Click / Drag</span>
              </div>
            )}
          </div>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
            onChange={handleLogoSelect}
          />

          <div className="flex-1 space-y-2">
            {logoMode === "upload" ? (
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("reseller.shopLogoDesc", { defaultValue: "Square image recommended (PNG, JPG, or SVG up to 5MB)." })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" /> Select Image
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => setLogoPreview("")}
                      className="rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://example.com/my-logo.png"
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={applyLogoUrl}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview("")}
                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear current logo
                  </button>
                )}
              </div>
            )}

            {/* Quick Preset Logos */}
            <div className="pt-2 border-t border-border">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                <Sparkles className="h-3 w-3 text-primary" /> Preset Avatars
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_LOGOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLogoPreview(preset)}
                    className="h-8 w-8 rounded-lg overflow-hidden border border-border hover:border-primary hover:scale-105 transition-all p-0.5 bg-background shadow-xs"
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Banner Section */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {t("reseller.heroBanner", { defaultValue: "Shop Hero Banner" })}
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setBannerMode("upload")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                bannerMode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setBannerMode("url")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                bannerMode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Banner URL
            </button>
          </div>
        </div>

        {/* Banner Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingBanner(true);
          }}
          onDragLeave={() => setIsDraggingBanner(false)}
          onDrop={handleBannerDrop}
          onClick={() => bannerInputRef.current?.click()}
          className={`relative flex items-center justify-center w-full aspect-[21/8] rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden group ${
            isDraggingBanner
              ? "border-primary bg-primary/10 ring-4 ring-primary/20"
              : "border-border bg-muted/40 hover:border-primary/50"
          }`}
        >
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Hero Banner"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground p-4 text-center">
              <Upload className="h-6 w-6 text-primary group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-semibold text-foreground">
                {t("common.upload", { defaultValue: "Click or drag to upload header banner" })}
              </span>
              <span className="text-[11px] text-muted-foreground">Recommended ratio: 21:9 or 16:9</span>
            </div>
          )}
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onClick={(e) => {
            (e.target as HTMLInputElement).value = "";
          }}
          onChange={handleBannerSelect}
        />

        {bannerMode === "upload" ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t("reseller.heroBannerDesc", {
                defaultValue: "Displays at the top of your public storefront (up to 10MB).",
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Choose Banner
              </button>
              {bannerPreview && (
                <button
                  type="button"
                  onClick={() => setBannerPreview("")}
                  className="rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={bannerUrlInput}
                onChange={(e) => setBannerUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={applyBannerUrl}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Apply URL
              </button>
            </div>
            {bannerPreview && (
              <button
                type="button"
                onClick={() => setBannerPreview("")}
                className="text-xs text-destructive hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear current banner
              </button>
            )}
          </div>
        )}

        {/* Curated Preset Banners */}
        <div className="pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Curated Banner Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_BANNERS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBannerPreview(preset.url)}
                className={`relative rounded-xl overflow-hidden border text-left p-1 transition-all group ${
                  bannerPreview === preset.url
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="h-12 w-full rounded-lg overflow-hidden relative">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white drop-shadow-sm truncate">{preset.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Picker Section */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("reseller.storeTheme", { defaultValue: "Storefront Visual Theme" })}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative rounded-2xl border p-3.5 text-left transition-all ${
                selectedTheme === theme.id
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {selectedTheme === theme.id && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-xs">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-full h-12 rounded-xl mb-2.5 ${theme.preview}`} />
              <p className="text-sm font-bold text-card-foreground">{theme.name}</p>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5">{theme.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Save Button (Fixed Footer) */}
      <div className="sticky bottom-4 z-20 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>
            {isSaving
              ? t("common.saving", { defaultValue: "Saving changes..." })
              : t("common.saveChanges", { defaultValue: "Save Shop Decoration" })}
          </span>
        </button>
      </div>
    </div>
  );
}
