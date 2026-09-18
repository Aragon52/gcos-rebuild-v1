import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ResellerProvider } from "@/lib/reseller-context";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { ProductsProvider } from "@/lib/products-context";
import { ProductSyncProvider } from "@/context/ProductSyncContext";
import { SeasonalThemeProvider } from "@/lib/seasonal-theme-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initPWAInstall } from "@/lib/pwa-install";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#009000" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "GCOS" },
      { title: "GCOS | Global online marketplace" },
      {
        name: "description",
        content:
          "Shop premium products from verified sellers worldwide. Discover reseller stores, enjoy secure checkout, and get world-class customer support.",
      },
      { name: "keywords", content: "online marketplace, global shopping, ecommerce, products, reseller portal" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "GCOS | Global online marketplace" },
      {
        property: "og:description",
        content:
          "Shop premium products from verified sellers worldwide. Discover reseller stores, enjoy secure checkout, and get world-class customer support.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/" },
      { property: "og:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "GCOS Global online marketplace" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/brand/icon-192.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initPWAInstall();
    // Register the service worker only on real production domains — never in
    // dev, iframes, or Lovable previews, where it would serve stale caches.
    const host = window.location.hostname;
    const isPreviewHost =
      host.startsWith('id-preview--') ||
      host.startsWith('preview--') ||
      host === 'lovableproject.com' ||
      host.endsWith('.lovableproject.com') ||
      host.endsWith('.lovable.app') ||
      host.endsWith('.lovableproject-dev.com') ||
      host.endsWith('.beta.lovable.dev');
    const swDisabled = new URLSearchParams(window.location.search).has('sw');
    if (
      'serviceWorker' in navigator &&
      import.meta.env.PROD &&
      window.self === window.top &&
      !isPreviewHost &&
      !swDisabled
    ) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[v0] Service worker registration failed:', error);
      });
    } else if ('serviceWorker' in navigator && (isPreviewHost || swDisabled)) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }
  }, []);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "GCOS",
        url: "https://globalcart-onlineshop.com/",
        logo: "https://globalcart-onlineshop.com/brand/logo-header.svg",
        contactPoint: {
          "@type": "ContactPoint",
          url: "https://globalcart-onlineshop.com/contact",
          contactType: "customer support",
        },
      },
      {
        "@type": "WebSite",
        name: "GCOS",
        url: "https://globalcart-onlineshop.com/",
        description: "Global online marketplace for products, categories, and reseller stores.",
      },
    ],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              <ProductsProvider>
                <ProductSyncProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <ResellerProvider>
                        <SeasonalThemeProvider>
                          <CustomerAuthProvider>
                            <AdminAuthProvider>
                              <Toaster />
                              <Sonner />
                              <Outlet />
                            </AdminAuthProvider>
                          </CustomerAuthProvider>
                        </SeasonalThemeProvider>
                      </ResellerProvider>
                    </WishlistProvider>
                  </CartProvider>
                </ProductSyncProvider>
              </ProductsProvider>
            </TooltipProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
