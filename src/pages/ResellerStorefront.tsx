import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { useReseller, type StoreTheme, type ResellerProfile, LEVEL_PROFIT_MAP } from "@/lib/reseller-context-hooks";
import { useProducts } from "@/lib/products-context-hooks";
import {
  ShoppingCart,
  Star,
  Store,
  Search,
  Share2,
  Check,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Headset,
} from "lucide-react";
import { useCart } from "@/lib/cart-context-hooks";
import { useToast } from "@/hooks/use-toast";
import { parseImageUrl } from "@/lib/utils";
import { getStorefrontUrl } from "@/lib/subdomain";

const LEVEL_BADGE_MAP: Record<string, number> = {
  "VIP-0": 0,
  "VIP-1": 1,
  "VIP-2": 2,
  "VIP-3": 3,
  "VIP-4": 4,
  "VIP-5": 5,
};

const themeStyles: Record<
  StoreTheme,
  {
    wrapper: string;
    headerCard: string;
    card: string;
    cardTitle: string;
    badge: string;
    price: string;
    button: string;
    sectionTitle: string;
    chipActive: string;
    chipInactive: string;
  }
> = {
  minimal: {
    wrapper: "bg-background min-h-screen",
    headerCard: "bg-card border-border shadow-xs",
    card: "rounded-2xl border border-border bg-card hover:shadow-md transition-all duration-200",
    cardTitle: "text-sm font-medium text-card-foreground",
    badge: "bg-primary/10 text-primary border border-primary/20",
    price: "text-foreground font-bold text-base",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
    sectionTitle: "text-lg font-bold tracking-tight text-foreground",
    chipActive: "bg-primary text-primary-foreground shadow-xs",
    chipInactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  bold: {
    wrapper: "bg-slate-950 text-slate-50 min-h-screen",
    headerCard: "bg-slate-900 border-slate-800 shadow-md",
    card: "rounded-2xl border-2 border-slate-800 bg-slate-900 hover:border-primary/60 transition-all duration-200",
    cardTitle: "text-sm font-bold text-white",
    badge: "bg-primary text-primary-foreground font-bold",
    price: "text-primary font-black text-lg",
    button: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase",
    sectionTitle: "text-lg font-black uppercase tracking-wider text-white",
    chipActive: "bg-primary text-primary-foreground shadow-xs",
    chipInactive: "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800",
  },
  elegant: {
    wrapper: "bg-background min-h-screen",
    headerCard: "bg-gradient-to-b from-card to-card/95 border-amber-500/20 shadow-md",
    card: "rounded-2xl border border-amber-500/20 bg-card hover:shadow-lg hover:border-amber-500/40 transition-all duration-200",
    cardTitle: "text-sm font-medium text-card-foreground font-serif",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    price: "text-amber-600 dark:text-amber-400 font-bold text-base font-serif",
    button: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-xs",
    sectionTitle: "text-lg font-serif font-bold text-foreground",
    chipActive: "bg-amber-500 text-white shadow-xs",
    chipInactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  vibrant: {
    wrapper: "bg-background min-h-screen",
    headerCard: "bg-card border-indigo-500/20 shadow-md",
    card: "rounded-2xl border-2 border-indigo-500/20 bg-card hover:scale-[1.01] hover:border-indigo-500/40 transition-all duration-200",
    cardTitle: "text-sm font-bold text-card-foreground",
    badge: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold",
    price: "text-indigo-600 dark:text-indigo-400 font-extrabold text-base",
    button: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xs",
    sectionTitle: "text-lg font-extrabold tracking-tight text-foreground",
    chipActive: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs",
    chipInactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
};

export default function ResellerStorefront() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { getResellerBySlug, fetchResellerBySlug } = useReseller();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { products, categories, isLoading: isProductsLoading } = useProducts();

  const [shop, setShop] = useState<ResellerProfile | null>(slug ? getResellerBySlug(slug) : null);
  const [isFetching, setIsFetching] = useState(!shop && !!slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  useEffect(() => {
    async function loadShop() {
      if (!slug) return;

      // Try local first
      const localShop = getResellerBySlug(slug);
      if (localShop) {
        setShop(localShop);
        setIsFetching(false);
        return;
      }

      // Fetch from Firestore
      setIsFetching(true);
      try {
        const fetchedShop = await fetchResellerBySlug(slug);
        setShop(fetchedShop);
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setIsFetching(false);
      }
    }

    loadShop();
  }, [slug, getResellerBySlug, fetchResellerBySlug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop?.shopName || "Reseller Store",
          text: `Check out ${shop?.shopName || "this store"} on GCOS!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast({
        title: t("common.linkCopied", { defaultValue: "Link copied!" }),
        description: t("reseller.storeUrlCopied", { defaultValue: "Storefront link has been copied to your clipboard." }),
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast({
        title: t("common.error", { defaultValue: "Error" }),
        description: t("common.couldNotCopy", { defaultValue: "Could not copy link." }),
        variant: "destructive",
      });
    }
  };

  if (isFetching || isProductsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading storefront...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{t("common.shopNotFound", { defaultValue: "Shop Not Found" })}</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {t("common.shopNotFoundDesc", { defaultValue: "The store you are looking for does not exist or has been removed." })}
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("common.backToHome", { defaultValue: "Back to Marketplace" })}
        </Link>
      </div>
    );
  }

  if (shop.isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Retail Shop Suspended</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
          This store ({shop.shopName}) is temporarily unavailable. If you are the store owner, please sign in to the Reseller Portal to contact customer service and request account review.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/reseller/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Headset className="h-4 w-4" />
            Reseller Login &amp; Contact Support
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const currentThemeId = shop.storeTheme || "minimal";
  const theme = themeStyles[currentThemeId] || themeStyles.minimal;
  const profitMargin = shop.level ? LEVEL_PROFIT_MAP[shop.level] || 0.15 : 0.15;
  const selectedIds = new Set(shop.selectedProductIds || []);

  // Filter products by seller selection
  const rawShopProducts = products.filter((p) => selectedIds.has(p.id));

  // Extract available categories within this specific seller's inventory
  const availableCategorySlugs = new Set(
    rawShopProducts.map((p) => (p.category || "uncategorized").toLowerCase().replace(/\s+/g, "-"))
  );
  const relevantCategories = categories.filter((c) => availableCategorySlugs.has(c.slug));

  // Search, filter, and sort
  const filteredProducts = rawShopProducts
    .filter((p) => {
      const pCat = (p.category || "Uncategorized").toLowerCase();
      const pCatSlug = pCat.replace(/\s+/g, "-");
      const matchesCategory = selectedCategory === "all" || pCatSlug === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pCat.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.price * (1 + profitMargin);
      const priceB = b.price * (1 + profitMargin);
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
      return 0; // featured default
    });

  const handleAddToCart = (product: (typeof products)[number]) => {
    const adjustedProduct = {
      ...product,
      price: product.price * (1 + profitMargin),
    };
    addItem(adjustedProduct, 1, shop.id);
    toast({
      title: t("common.addedToCart", { defaultValue: "Added to cart" }),
      description: product.name,
    });
  };

  const levelBadgeNum = LEVEL_BADGE_MAP[shop.level || "VIP-0"] ?? 0;

  return (
    <div className={theme.wrapper}>
      <SEO
        title={`${shop.shopName || "Reseller Store"} | Verified Reseller Store`}
        description={
          shop.shopDescription ||
          `Shop exclusive products curated by ${shop.shopName} on GCOS Global Marketplace. Fast worldwide shipping & buyer protection.`
        }
        ogImage={shop.shopHeroBanner || shop.shopLogo}
        ogImageAlt={shop.shopName}
        resellerStore={{
          name: shop.shopName,
          description: shop.shopDescription,
          image: shop.shopHeroBanner || shop.shopLogo,
          ownerName: shop.firstName && shop.lastName ? `${shop.firstName} ${shop.lastName}` : undefined,
          url: getStorefrontUrl(shop.shopSlug || slug || ""),
        }}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Stores", item: "/" },
          { name: shop.shopName, item: `/store/${shop.shopSlug || slug}` },
        ]}
      />

      {/* Hero Header Area Matching Setting Preview */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">
        <div className={`relative rounded-2xl overflow-hidden border ${theme.headerCard} shadow-sm`}>
          {/* Banner Image */}
          <div className="h-40 sm:h-56 md:h-64 w-full relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
            {shop.shopHeroBanner ? (
              <img
                src={parseImageUrl(shop.shopHeroBanner) || "/placeholder.svg"}
                alt={shop.shopName}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="text-xs text-white/50 flex items-center gap-2 font-medium">
                <Store className="h-5 w-5 text-white/40" /> Verified Reseller Storefront
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

            {/* Top Bar Quick Action */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all shadow-sm"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copiedLink ? t("common.copied", { defaultValue: "Copied!" }) : t("common.share", { defaultValue: "Share" })}</span>
              </button>
            </div>
          </div>

          {/* Store Info Bar (Overlapping Preview Style) */}
          <div className="px-4 sm:px-6 pb-5 pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-start sm:items-end gap-3.5 sm:gap-4 min-w-0">
              {/* Overlapping Logo */}
              <div className="-mt-10 sm:-mt-14 relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-card bg-background shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 z-10">
                {shop.shopLogo ? (
                  <img
                    src={parseImageUrl(shop.shopLogo) || "/placeholder.svg"}
                    alt={shop.shopName}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <Store className="h-8 w-8 text-primary" />
                )}
              </div>

              {/* Title & Badges */}
              <div className="min-w-0 flex-1 pt-1 sm:pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    {shop.shopName || "Reseller Store"}
                  </h1>
                  {shop.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold border border-primary/20">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                  {getStorefrontUrl(shop.shopSlug || slug || "store")}
                </p>

                {/* Rating & Level */}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.round(shop.starRating ?? 5.0)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-0.5">
                      {(shop.starRating ?? 5.0).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <img
                      src={`/badges/level-${levelBadgeNum}.png`}
                      alt={shop.level || "VIP-0"}
                      className="h-5 w-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs font-semibold text-foreground">{shop.level || "VIP-0"}</span>
                  </div>

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    <span>
                      {rawShopProducts.length} {t("reseller.products", { defaultValue: "Products" })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Info */}
            {shop.shopDescription && (
              <p className="text-xs text-muted-foreground max-w-sm line-clamp-2 mt-1 sm:mt-0">
                {shop.shopDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Catalog & Search Area */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-5">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("reseller.searchProductsInShop", {
                defaultValue: `Search in ${shop.shopName || "store"}...`,
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-card border border-input px-3 py-1.5 rounded-xl text-xs font-medium text-foreground shadow-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === "all" ? theme.chipActive : theme.chipInactive
            }`}
          >
            {t("common.all", { defaultValue: "All Products" })} ({rawShopProducts.length})
          </button>
          {relevantCategories.map((cat) => {
            const count = rawShopProducts.filter(
              (p) => (p.category || "uncategorized").toLowerCase().replace(/\s+/g, "-") === cat.slug
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.slug ? theme.chipActive : theme.chipInactive
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-1">
          <h2 className={theme.sectionTitle}>
            {selectedCategory === "all"
              ? t("common.allProducts", { defaultValue: "Store Collection" })
              : relevantCategories.find((c) => c.slug === selectedCategory)?.name || "Products"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-foreground">
              {rawShopProducts.length === 0
                ? t("common.noProductsAvailable", { defaultValue: "No products currently available" })
                : t("reseller.noProductsFound", { defaultValue: "No products matching your search" })}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {rawShopProducts.length === 0
                ? "This reseller is currently curating their catalog. Please check back soon!"
                : "Try adjusting your search terms or filter selection."}
            </p>
            {selectedCategory !== "all" || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const adjustedPrice = product.price * (1 + profitMargin);
              const adjustedOriginalPrice = product.originalPrice
                ? product.originalPrice * (1 + profitMargin)
                : null;

              return (
                <div key={product.id} className={`flex flex-col overflow-hidden ${theme.card} group`}>
                  <Link
                    to={`/products/${product.id}?shop=${shop.shopSlug || slug}`}
                    className="relative aspect-square bg-muted overflow-hidden block"
                  >
                    <img
                      src={parseImageUrl(product.image) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    {product.badge && (
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${theme.badge}`}>
                        {product.badge}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-col flex-1 p-3 sm:p-3.5">
                    <Link
                      to={`/products/${product.id}?shop=${shop.shopSlug || slug}`}
                      className="hover:underline"
                    >
                      <h3 className={`line-clamp-2 leading-snug ${theme.cardTitle}`}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.round(product.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground ml-0.5">
                        {product.rating || "5.0"}
                      </span>
                    </div>

                    {/* Pricing and Cart Action */}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border/50">
                      <div className="min-w-0">
                        <span className={theme.price}>${adjustedPrice.toFixed(2)}</span>
                        {adjustedOriginalPrice && (
                          <span className="text-[11px] text-muted-foreground line-through block -mt-0.5">
                            ${adjustedOriginalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${theme.button}`}
                        title={t("common.addToCart", { defaultValue: "Add to cart" })}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
