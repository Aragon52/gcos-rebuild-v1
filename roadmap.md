# GCOS Migration Roadmap

## Done
- [x] Ported app code (112 components, 59 pages, contexts, services, assets, i18n, PWA files)
- [x] TanStack Start root: providers, toasters, i18n, head meta, Tailwind v4 + legacy config
- [x] router-compat shim (no react-router-dom); all imports rewritten
- [x] 54 TanStack route files for customer/reseller/admin portals with per-route head() meta
- [x] Express API → 8 TanStack server routes (register-reseller, reseller/request-reset, admin/*, scrape, sync, send-notification, health)
- [x] All TypeScript errors cleared (tsgo: 0 errors)
- [x] SSR fixes: i18n document guard, use-support localStorage, Footer isDev, Header language label, window.location URLSearchParams in Categories/ProductDetail/ResellerLogin
- [x] Smoke tests: /, /categories, /products/1, /cart, /store/test, /account, /reseller/login, /admin/auth/sign-in all 200 + clean consoles; /api/health 200

## Waiting on user
- [ ] Connect existing Supabase project: Project Settings → Connectors → Supabase (keeps current sign-ins and data)
- [ ] Provide SUPABASE_SERVICE_ROLE_KEY via the Lovable secret form (needed by /api/admin/* endpoints)
- [ ] Confirm whether external callers hit /api/sync (scraper sync jobs) and whether /.well-known/assetlinks.json is needed
