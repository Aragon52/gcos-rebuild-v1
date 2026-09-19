import React, { useEffect } from "react";
import { getBrandConfig, type Portal } from "@/lib/brand-metadata";

export interface ProductSEOData {
  name: string;
  description?: string;
  price: number | string;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  condition?: "NewCondition" | "RefurbishedCondition" | "UsedCondition";
  brand?: string;
  sku?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface ResellerStoreSEOData {
  name: string;
  description?: string;
  image?: string;
  ownerName?: string;
  url?: string;
  memberSince?: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  ogType?: "website" | "product" | "article" | "profile" | "business.business";
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number | string;
  ogImageHeight?: number | string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  robots?: string;
  noindex?: boolean;
  portal?: Portal | "admin";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  schema?: Record<string, any> | Array<Record<string, any>>;
  product?: ProductSEOData;
  breadcrumbs?: BreadcrumbItem[];
  resellerStore?: ResellerStoreSEOData;
}

/**
 * Utility helper to set or create a <meta> tag in the document <head>
 */
function setMetaTag(attrName: "name" | "property", attrValue: string, content: string | undefined | null) {
  if (typeof document === "undefined") return;

  const selector = `meta[${attrName}="${attrValue}"]`;
  let element = document.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    // Remove if content is explicitly cleared
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    element.setAttribute("data-dynamic-seo", "true");
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

/**
 * Utility helper to set or create a <link rel="..."> tag in document <head>
 */
function setLinkTag(rel: string, href: string | undefined | null) {
  if (typeof document === "undefined") return;

  const selector = `link[rel="${rel}"]`;
  let element = document.querySelector<HTMLLinkElement>(selector);

  if (!href) {
    if (element && element.hasAttribute("data-dynamic-seo")) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    element.setAttribute("data-dynamic-seo", "true");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

/**
 * Utility helper to set or update Schema.org JSON-LD structured data in document <head>
 */
function setJsonLd(schemaData: object | null) {
  if (typeof document === "undefined") return;

  const scriptId = "seo-dynamic-jsonld";
  let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!schemaData) {
    if (scriptElement) {
      scriptElement.remove();
    }
    return;
  }

  if (!scriptElement) {
    scriptElement = document.createElement("script");
    scriptElement.id = scriptId;
    scriptElement.type = "application/ld+json";
    document.head.appendChild(scriptElement);
  }

  try {
    scriptElement.textContent = JSON.stringify(schemaData);
  } catch (err) {
    console.error("Failed to serialize SEO JSON-LD schema:", err);
  }
}

/**
 * Custom React Hook for dynamically updating SEO metadata and JSON-LD schema
 */
export function useSEO(props: SEOProps) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const portalKey: Portal = props.portal === "reseller" ? "reseller" : "customer";
    const brand = getBrandConfig(portalKey);

    // 1. Format Title
    const rawTitle = props.title?.trim() || "";
    let finalTitle = brand.title;

    if (rawTitle) {
      const brandSuffix = props.portal === "reseller" ? "GCOS Reseller Portal" : "GCOS Global Marketplace";
      if (rawTitle.toLowerCase().includes("gcos")) {
        finalTitle = rawTitle;
      } else {
        finalTitle = `${rawTitle} | ${brandSuffix}`;
      }
    }

    document.title = finalTitle;

    // 2. Canonical & Current URL
    const currentOrigin = window.location.origin;
    const currentPath = window.location.pathname + window.location.search;
    const currentUrl = currentOrigin + currentPath;
    const canonicalUrl = props.canonical || currentUrl;

    // 3. Description & Keywords
    const finalDescription = props.description?.trim() || brand.description;
    let finalKeywords: string = brand.keywords.join(", ");
    if (props.keywords) {
      finalKeywords = Array.isArray(props.keywords) ? props.keywords.join(", ") : props.keywords;
    }

    // 4. Robots & Indexing
    const robotsContent = props.noindex ? "noindex, nofollow" : props.robots || "index, follow";

    // 5. OpenGraph & Twitter Images
    const ogImage = props.ogImage
      ? props.ogImage.startsWith("http") || props.ogImage.startsWith("/")
        ? props.ogImage
        : `/${props.ogImage}`
      : brand.ogImage;
    const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${currentOrigin}${ogImage}`;
    const ogImageAlt = props.ogImageAlt || props.title || brand.ogImageAlt;

    // --- Standard Meta Tags ---
    setMetaTag("name", "description", finalDescription);
    setMetaTag("name", "keywords", finalKeywords);
    setMetaTag("name", "robots", robotsContent);
    if (props.author) {
      setMetaTag("name", "author", props.author);
    }

    // --- Canonical Link ---
    setLinkTag("canonical", canonicalUrl);

    // --- OpenGraph Tags ---
    setMetaTag("property", "og:title", finalTitle);
    setMetaTag("property", "og:description", finalDescription);
    setMetaTag("property", "og:type", props.ogType || (props.product ? "product" : "website"));
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:site_name", props.portal === "reseller" ? "GCOS Reseller" : "GCOS");
    setMetaTag("property", "og:image", absoluteOgImage);
    setMetaTag("property", "og:image:alt", ogImageAlt);
    if (props.ogImageWidth) setMetaTag("property", "og:image:width", String(props.ogImageWidth));
    if (props.ogImageHeight) setMetaTag("property", "og:image:height", String(props.ogImageHeight));

    // --- Product Specific OG Tags ---
    if (props.product) {
      setMetaTag("property", "product:price:amount", String(props.product.price));
      setMetaTag("property", "product:price:currency", props.product.currency || "USD");
      setMetaTag("property", "product:availability", props.product.availability || "InStock");
      if (props.product.brand) setMetaTag("property", "product:brand", props.product.brand);
      if (props.product.category) setMetaTag("property", "product:category", props.product.category);
    } else {
      setMetaTag("property", "product:price:amount", null);
      setMetaTag("property", "product:price:currency", null);
      setMetaTag("property", "product:availability", null);
      setMetaTag("property", "product:brand", null);
      setMetaTag("property", "product:category", null);
    }

    // --- Twitter / X Cards ---
    setMetaTag("name", "twitter:card", props.twitterCard || "summary_large_image");
    setMetaTag("name", "twitter:title", finalTitle);
    setMetaTag("name", "twitter:description", finalDescription);
    setMetaTag("name", "twitter:image", absoluteOgImage);
    setMetaTag("name", "twitter:image:alt", ogImageAlt);

    // 6. Schema.org JSON-LD Generation
    let generatedSchemas: any[] = [];

    // Custom passed Schema
    if (props.schema) {
      if (Array.isArray(props.schema)) {
        generatedSchemas.push(...props.schema);
      } else {
        generatedSchemas.push(props.schema);
      }
    }

    // BreadcrumbList Schema
    if (props.breadcrumbs && props.breadcrumbs.length > 0) {
      generatedSchemas.push({
        "@type": "BreadcrumbList",
        itemListElement: props.breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: b.name,
          item: b.item.startsWith("http") ? b.item : `${currentOrigin}${b.item}`,
        })),
      });
    }

    // Product Schema
    if (props.product) {
      const p = props.product;
      const productImages = p.images && p.images.length > 0
        ? p.images.map(img => (img.startsWith("http") ? img : `${currentOrigin}${img}`))
        : [absoluteOgImage];

      const productSchema: Record<string, any> = {
        "@type": "Product",
        name: p.name,
        description: p.description || finalDescription,
        image: productImages,
        offers: {
          "@type": "Offer",
          price: String(p.price),
          priceCurrency: p.currency || "USD",
          availability: `https://schema.org/${p.availability || "InStock"}`,
          itemCondition: `https://schema.org/${p.condition || "NewCondition"}`,
          url: canonicalUrl,
        },
      };

      if (p.brand) {
        productSchema.brand = {
          "@type": "Brand",
          name: p.brand,
        };
      }

      if (p.sku) {
        productSchema.sku = p.sku;
      }

      if (p.category) {
        productSchema.category = p.category;
      }

      if (p.rating && p.rating > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: p.rating,
          reviewCount: Math.max(1, p.reviewCount || 1),
          bestRating: "5",
          worstRating: "1",
        };
      }

      generatedSchemas.push(productSchema);
    }

    // Reseller Storefront Schema
    if (props.resellerStore) {
      const s = props.resellerStore;
      generatedSchemas.push({
        "@type": "Store",
        name: s.name,
        description: s.description || finalDescription,
        image: s.image ? (s.image.startsWith("http") ? s.image : `${currentOrigin}${s.image}`) : absoluteOgImage,
        url: s.url || canonicalUrl,
        founder: s.ownerName
          ? {
              "@type": "Person",
              name: s.ownerName,
            }
          : undefined,
      });
    }

    // Default WebSite/WebPage Schema if nothing else added
    if (generatedSchemas.length === 0) {
      generatedSchemas.push({
        "@type": "WebPage",
        name: finalTitle,
        description: finalDescription,
        url: canonicalUrl,
      });
    }

    const finalJsonLd = {
      "@context": "https://schema.org",
      "@graph": generatedSchemas,
    };

    setJsonLd(finalJsonLd);
  }, [
    props.title,
    props.description,
    props.keywords,
    props.canonical,
    props.ogType,
    props.ogImage,
    props.ogImageAlt,
    props.ogImageWidth,
    props.ogImageHeight,
    props.twitterCard,
    props.robots,
    props.noindex,
    props.portal,
    props.author,
    props.publishedTime,
    props.modifiedTime,
    props.section,
    props.schema,
    props.product,
    props.breadcrumbs,
    props.resellerStore,
  ]);
}

/**
 * Reusable SEO component to manage meta tags, OpenGraph, Twitter cards,
 * and Schema.org structured data dynamically per page.
 */
export default function SEO(props: SEOProps) {
  useSEO(props);
  return null;
}
