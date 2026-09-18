# Migrate GCOS production app into Lovable

Rebuild the uploaded Vite/React-Router/Express + Supabase app ("GCOS" multi-portal marketplace) as a modern Lovable app, preserving existing user sign-ins.

## What the source contains
- Storefront: home, categories, product detail, cart (with guest/login/register), reseller storefronts, account, orders, about/contact/privacy/terms
- Reseller portal: product selection, deposits/withdrawals, chat, notifications, SLA views
- Admin portal: reseller/staff management, verification, payments (ARS deposit/withdrawal/payment-info), audit logs, broadcast notifications, seasonal themes
- Express API (~780 lines): health, admin create/delete/verify, reseller registration and password reset, scrape, sync, send-notification
- Database schema: 22 tables (users, sla_admins/staff, reseller_profiles, retail_shops, products, reviews, orders/order_items, chats, notifications, deposit/withdrawal requests, virtual customers, audit logs, settings, seasonal themes)
- Extras: PWA/service worker, i18n (many locales), scraper (cheerio), product sync service

## Plan

1. **Connect your existing backend first (you do this, 2 minutes):**
   Project Settings → Connectors → Supabase → connect your existing GCOS Supabase project via browser sign-in. This keeps all current user accounts, passwords, and data working — no password resets needed. I cannot do this step for you; everything else below I handle.

2. **Framework rebuild:** Port the app to this project's TanStack Start structure — all storefront, reseller, and admin pages become proper routes with the same URLs (/categories, /products/:id, /store/:slug, /cart, /account, /orders, /reseller/*, /admin/*, etc.), keeping the existing design, components, i18n locales, and PWA behavior where compatible.

3. **API conversion:** Convert the Express endpoints (admin user management, reseller registration/reset, notifications, scrape, sync) into server functions/routes. Admin operations run server-side with the service-role key; row-level security governs everything else.

4. **Auth:** Keep Supabase Auth as-is (email/password per portal). Map the admin/reseller/customer login contexts and role checks onto the existing `users` / `sla_admins` / `reseller_profiles` tables unchanged.

5. **Secrets:** I'll securely request the two values needed server-side (your Supabase service-role key and anon key) via Lovable's secret form when wiring the server functions — never pasted in chat.

6. **Verify:** Build green, then exercise key flows: storefront browsing, cart/checkout, reseller login + deposit request, admin login + reseller verification, notifications.

## Still needed from you (after the preview)
1. Connect your existing Supabase project (step 1 above).
2. Data exports (CSV/JSON) are only needed if any data lives outside Supabase — if everything is in your Supabase database, connecting it covers all existing records automatically.

## Technical notes
- Target stack is fixed: TanStack Start + Tailwind v4; Express server.ts logic becomes `createServerFn` handlers / `src/routes/api/*` endpoints.
- The cheerio-based scraper and sync jobs will be re-checked for edge-runtime compatibility; if a package can't run, I'll flag it with an alternative.
- Out of scope unless you confirm: the `/.well-known/assetlinks.json` (Android app link) and any external cron callers of /api/sync — tell me if external services call these URLs.
