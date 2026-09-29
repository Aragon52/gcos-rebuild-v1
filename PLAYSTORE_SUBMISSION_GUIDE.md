# Google Play Store Publishing & Asset Distribution Guide

This document contains everything needed to list and publish the **GCOS Reseller Portal** application on the **Google Play Store**.

---

## 1. Generated Visual Assets Pack

All Google Play Store and Android launcher assets are generated and packaged in:
- **Downloadable Bundle**: `/playstore-assets.zip` (Accessible via direct download or the portal UI)
- **Directory Structure**: `/public/playstore/`

### Asset Inventory:
| Category | File | Dimensions | Purpose |
| :--- | :--- | :--- | :--- |
| **Play Store Listing** | `store_listing/playstore-icon-512x512.png` | 512 x 512 px | Official Hi-Res App Icon (32-bit PNG) |
| **Play Store Listing** | `store_listing/playstore-feature-graphic-1024x500.png` | 1024 x 500 px | Required Feature Graphic Banner |
| **Play Store Listing** | `store_listing/playstore-feature-graphic-1024x500.svg` | Vector SVG | Master Vector Banner |
| **Android Launcher** | `android/res/mipmap-mdpi/ic_launcher.png` | 48 x 48 px | Medium density app launcher icon |
| **Android Launcher** | `android/res/mipmap-hdpi/ic_launcher.png` | 72 x 72 px | High density app launcher icon |
| **Android Launcher** | `android/res/mipmap-xhdpi/ic_launcher.png` | 96 x 96 px | Extra-high density app launcher icon |
| **Android Launcher** | `android/res/mipmap-xxhdpi/ic_launcher.png` | 144 x 144 px | Extra-extra-high density launcher icon |
| **Android Launcher** | `android/res/mipmap-xxxhdpi/ic_launcher.png` | 192 x 192 px | Ultra density app launcher icon |
| **Android Adaptive** | `android/ic_launcher_foreground.svg` / `.png` | 432 x 432 px | Adaptive Icon Foreground Layer |
| **Android Adaptive** | `android/ic_launcher_background.svg` / `.png` | 432 x 432 px | Adaptive Icon Background Layer |
| **Logo Pack** | `logos/logo-horizontal-dark.svg` / `.png` | 960 x 240 px | Primary Horizontal Logo (Dark themes) |
| **Logo Pack** | `logos/logo-horizontal-light.svg` / `.png` | 960 x 240 px | Primary Horizontal Logo (Light themes) |
| **Logo Pack** | `logos/logo-icon-mark.svg` / `logo-mark-512x512.png` | 512 x 512 px | Square Brand Badge Mark |
| **Web / PWA Icons** | `apple-touch-icon.png` (180px), `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png` | 180px - 512px | Browser & Home Screen Icons |

---

## 2. Google Play Console Listing Metadata

Copy and paste these exact verified details into your **Google Play Console** store listing:

- **App Name** (max 30 characters):  
  `GCOS Reseller Portal`

- **Short Description** (max 80 characters):  
  `Manage your online shop, orders, VIP profits and commissions on the go.`

- **Full Description** (max 4000 characters):  
```text
GCOS Reseller Portal is the all-in-one mobile command center for digital store owners, e-commerce resellers, and dropshipping partners.

Key Features:
- 🚀 Zero Inventory Risk: Select verified high-demand catalog products with automated supplier fulfillment.
- 💎 Dynamic VIP Margin Tiers: Earn up to 40% profit margins with tiered VIP progression and reward structures.
- 📊 Real-time Analytics: Track your daily shop turnover, order states, store visits, and revenue streams live.
- ⚡ Instant Balance & Daily Payouts: Request rapid withdrawals directly to your crypto USDT wallet or bank account.
- 🔔 Real-Time Order Alerts: Instant push notifications whenever a new customer order or commission arrives.
- 🛠️ Store Customization: Personalize your storefront theme, custom banner, logo, and promotional discount campaigns.

Join thousands of global merchants scaling their online stores with GlobalCart OS.
```

- **App Category**: `Shopping` (Secondary: `Business`)
- **Content Rating**: `Everyone` (PEGI 3 / ESRB Everyone)
- **Target Audience**: 18 and over
- **Privacy Policy URL**: `https://globalcart-onlineshop.com/reseller/privacy`
- **Support Email**: `support@globalcart-onlineshop.com`

---

## 3. Trusted Web Activity (TWA) & Digital Asset Links

The application is fully configured as a Google Play compatible **Trusted Web Activity (TWA)**.

1. **Digital Asset Links Verification File**:
   - Location: `public/.well-known/assetlinks.json`
   - Accessible at: `https://your-domain.com/.well-known/assetlinks.json`
   - Content:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.globalcart_onlineshop.reseller.twa",
       "sha256_cert_fingerprints": [
         "C4:3A:1F:29:73:38:C1:98:90:36:CF:B1:4E:03:6C:93:B8:58:2D:09:E6:68:84:36:11:6F:C8:D9:E5:00:7A:73"
       ]
     }
   }]
   ```

*(Note: Replace the SHA-256 fingerprint with your release Keystore's actual SHA-256 fingerprint generated during signing).*

---

## 4. Packaging the APK / Android App Bundle (.aab)

You can build the production `.aab` using either of the two standard Google-recommended methods:

### Method A: PWABuilder (Fastest, No Android Studio required)
1. Go to [PWABuilder.com](https://www.pwabuilder.com).
2. Enter your live Reseller Portal URL: `https://your-domain.com/reseller/`.
3. Click **Package for Stores** -> **Google Play**.
4. Upload `playstore-icon-512x512.png` and your signing Keystore.
5. Download the signed `.aab` package and upload directly to Google Play Console.

### Method B: Google Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://your-domain.com/manifest-reseller.json"
bubblewrap build
```
Upload the resulting `app-release-bundle.aab` directly to Google Play Console under **Production Releases**.
