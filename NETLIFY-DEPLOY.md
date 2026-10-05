# Deploying GCOS to Netlify (one site, three portals)

A single Netlify site serves the main shop, reseller portal, and admin portal using domain aliases. The app detects the incoming subdomain and routes to the correct portal automatically.

| Public address | Portal | Internal route |
|---|---|---|
| `globalcart-onlineshop.com` | Main storefront | `/` |
| `reseller.globalcart-onlineshop.com` | Reseller portal | `/reseller/*` |
| `admin.globalcart-onlineshop.com` | Admin portal | `/admin/*` |

---

## 1. Create / choose the Netlify site

1. In Netlify, create a new site (or use the existing GCOS site).
2. Connect it to your Git provider and select the GCOS repo, **or** drag-and-drop the build output.
3. Make sure the primary domain is set to `globalcart-onlineshop.com` (or `www.globalcart-onlineshop.com` with the apex redirecting to `www`).

---

## 2. Build settings

`netlify.toml` is already in the repo root. You do not need to change it.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `22` |
| Nitro preset | `netlify` (pinned in `vite.config.ts`; produces a `server` function routed on `/*`) |

---

## 3. Environment variables

Go to **Site configuration → Environment variables** and add these.

### Values you can copy directly

```
VITE_SUPABASE_URL=https://hreotqowulxpchyxjlai.supabase.co
VITE_SUPABASE_PROJECT_ID=hreotqowulxpchyxjlai
```

### Values you must copy from Supabase

1. Open https://supabase.com/dashboard/project/hreotqowulxpchyxjlai/settings/api
2. Copy the **anon public** key into:

```
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

3. Copy the **service_role secret** key into:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> `SUPABASE_SERVICE_ROLE_KEY` is used only by the server function. Never expose it in the browser.
>
> Also set `SUPABASE_URL` to the same Supabase URL as `VITE_SUPABASE_URL`. The server requires
> `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Domains & DNS

### Domain aliases on the same site

In Netlify, go to **Domain management → Custom domains** and add these as aliases of the same site:

- `reseller.globalcart-onlineshop.com`
- `admin.globalcart-onlineshop.com`

### DNS records

If your DNS is managed outside Netlify, add these records:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` (apex) | Netlify apex IP from your site dashboard | Auto |
| CNAME | `www` | your-netlify-site.netlify.app | Auto |
| CNAME | `reseller` | your-netlify-site.netlify.app | Auto |
| CNAME | `admin` | your-netlify-site.netlify.app | Auto |

If you use Netlify DNS, Netlify creates the records automatically when you add the aliases.

---

## 5. Redirect / rewrite rule (Netlify)

No redirect rule is needed. The Nitro `netlify` preset builds a single `server` function that registers itself on `/*`, and static files in `dist` are served first.

Do **not** add a catch-all rewrite such as `/*  /.netlify/functions/server  200` or `/*  /.netlify/functions-internal/server  200`. A function with its own route is not reachable at either of those URLs, so the rewrite makes every server-rendered page return Netlify's "Page not found".

Also do not add an `index.html` to `public/`: it would replace the server-rendered homepage with a blank page.

---

## 6. How the subdomain routing works

`src/lib/portal-host.ts` inspects the request host and maps it to an internal route prefix:

- `admin.globalcart-onlineshop.com/orders` → renders `/admin/orders`
- `reseller.globalcart-onlineshop.com/dashboard` → renders `/reseller/dashboard`
- `globalcart-onlineshop.com` → renders the storefront at `/`

Paths under `/api`, `/_serverFn`, `/assets`, and static files are never rewritten.

Path-based access still works on the main domain (`globalcart-onlineshop.com/admin/...`), which is what local development and the Lovable preview use.

---

## 7. Deploy

1. Push the repo to Git or trigger a manual deploy in Netlify.
2. Wait for the build to finish.
3. Visit each domain:
   - https://globalcart-onlineshop.com
   - https://admin.globalcart-onlineshop.com
   - https://reseller.globalcart-onlineshop.com

---

## Troubleshooting

- **Portal loads the wrong layout** — check that the domain aliases are on the same Netlify site and that HTTPS is enabled for each alias.
- **Netlify "Page not found" on every page** — remove any catch-all `/*` rewrite from `netlify.toml` or `public/_redirects`; the server function routes itself.
- **New deploys don't go live** — check **Deploys** in Netlify. If production shows "Auto publishing is locked", unlock it or publish the deploy you want.
- **Cloudflare "Just a moment..." page or 403 on a domain** — the DNS record for that host is proxied through Cloudflare (orange cloud). In Cloudflare DNS, switch the apex, `www`, `admin`, and `reseller` records to **DNS only** (grey cloud) so traffic goes straight to Netlify.
- **Build fails** — confirm Node 22 is selected and `NITRO_PRESET=netlify` is set.
- **Supabase auth errors** — double-check `VITE_SUPABASE_PUBLISHABLE_KEY` matches the anon key exactly.

---

## 8. Testing subdomain routing before connecting your production domain

Netlify deploy previews (`deploy-preview-123--site.netlify.app`) do **not** support custom `admin.` / `reseller.` subdomains, so use one of these approaches instead.

### Option A — Staging subdomains of your own domain (recommended)

If you already control `globalcart-onlineshop.com`, create a staging prefix first. This tests Netlify's real subdomain handling without touching the apex domain.

| Portal | Test address |
|---|---|
| Main shop | `staging.globalcart-onlineshop.com` |
| Admin portal | `admin.staging.globalcart-onlineshop.com` |
| Reseller portal | `reseller.staging.globalcart-onlineshop.com` |

DNS records at your registrar:

| Type | Name | Value |
|---|---|---|
| A | `staging` | Your Netlify apex IP (from the site dashboard) |
| CNAME | `admin.staging` | `your-site-name.netlify.app` |
| CNAME | `reseller.staging` | `your-site-name.netlify.app` |

In Netlify, add these three as **domain aliases** on the same site. Once DNS propagates, visiting `admin.staging.globalcart-onlineshop.com/orders` should open the admin orders page at its root.

### Option B — A separate cheap/test domain

Buy any inexpensive domain and point these records at Netlify:

| Type | Name | Value |
|---|---|---|
| A | `@` | Netlify apex IP |
| CNAME | `www` | `your-site-name.netlify.app` |
| CNAME | `admin` | `your-site-name.netlify.app` |
| CNAME | `reseller` | `your-site-name.netlify.app` |

Add all four as domain aliases. This is the closest possible test to your final production setup.

### Option C — Local `/etc/hosts` test (free, but not Netlify infrastructure)

To verify the routing logic locally without changing DNS, edit your hosts file:

- **macOS / Linux**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

Add:

```text
127.0.0.1 globalcart-onlineshop.local
127.0.0.1 admin.globalcart-onlineshop.local
127.0.0.1 reseller.globalcart-onlineshop.local
```

Then run the local dev server:

```bash
bun dev
```

Visit:

- `http://globalcart-onlineshop.local:8080` — main shop
- `http://admin.globalcart-onlineshop.local:8080` — admin portal
- `http://reseller.globalcart-onlineshop.local:8080` — reseller portal

This proves the app code rewrites subdomains to `/admin/*` and `/reseller/*` correctly, but it does not test Netlify's CDN or SSL.
