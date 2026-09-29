import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const OUTPUT_DIR = path.resolve("./public/playstore");
const BRAND_DIR = path.resolve("./public/brand");
const PUBLIC_DIR = path.resolve("./public");

// 1. High-fidelity Play Store 512x512 Icon SVG
const playStoreIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0A0F1D"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="30%" stop-color="#EAB308"/>
      <stop offset="70%" stop-color="#CA8A04"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="40%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="emeraldGlass" x1="150" y1="150" x2="350" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#047857" stop-opacity="0.95"/>
    </linearGradient>
    <radialGradient id="glowG" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
    </radialGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#10B981" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Base Container -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect width="510" height="510" x="1" y="1" rx="111" stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="256" cy="230" r="180" fill="url(#glowG)"/>

  <!-- Subtle High-tech Grid Lines -->
  <path d="M96 256 H416 M256 96 V416 M140 140 L372 372 M372 140 L140 372" stroke="#334155" stroke-width="1.5" stroke-opacity="0.35" stroke-dasharray="6 6"/>

  <g filter="url(#dropShadow)" transform="translate(4, -8)">
    <!-- Cart Base Wireframe & Wheels -->
    <path d="M110 160 H165 L200 310 Q204 322 218 322 H370 Q384 322 388 310 L418 195 Q422 180 405 180 H180" 
          stroke="url(#goldGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    
    <!-- Cart Front Support Bars -->
    <line x1="230" y1="322" x2="218" y2="355" stroke="url(#goldGrad)" stroke-width="14" stroke-linecap="round"/>
    <line x1="360" y1="322" x2="372" y2="355" stroke="url(#goldGrad)" stroke-width="14" stroke-linecap="round"/>

    <!-- Glowing Wheels -->
    <circle cx="215" cy="385" r="28" fill="#0F172A" stroke="url(#goldGrad)" stroke-width="12"/>
    <circle cx="215" cy="385" r="10" fill="#10B981"/>
    <circle cx="375" cy="385" r="28" fill="#0F172A" stroke="url(#goldGrad)" stroke-width="12"/>
    <circle cx="375" cy="385" r="10" fill="#10B981"/>

    <!-- 3D Merchant Storefront / Shopping Package Inside Cart -->
    <g filter="url(#iconGlow)">
      <!-- Store Building / Package 1 (Emerald) -->
      <rect x="210" y="200" width="85" height="100" rx="14" fill="url(#emeraldGlass)" stroke="#34D399" stroke-width="3"/>
      <!-- Store Roof Awning Stripes -->
      <path d="M205 200 L252 170 L300 200 Z" fill="#047857"/>
      <path d="M215 200 L252 175 L260 200 Z" fill="#34D399"/>
      <!-- Store Door / Growth Bar -->
      <rect x="235" y="240" width="35" height="60" rx="6" fill="#0F172A" fill-opacity="0.85"/>
      <path d="M245 285 L245 260 M252 285 L252 250 M260 285 L260 240" stroke="#34D399" stroke-width="3" stroke-linecap="round"/>

      <!-- Package 2 (Gold Box) -->
      <rect x="290" y="215" width="80" height="85" rx="12" fill="url(#goldGrad)"/>
      <path d="M330 215 V300 M290 257 H370" stroke="#78350F" stroke-width="4" stroke-opacity="0.4"/>
      <!-- Ribbon Bow -->
      <circle cx="330" cy="215" r="8" fill="#FDE047"/>
    </g>

    <!-- Global Cart Letters Badge G C -->
    <g transform="translate(195, 115) scale(0.95)">
      <text x="50" y="70" fill="url(#goldGrad)" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="76" letter-spacing="-2">G</text>
      <text x="105" y="70" fill="url(#greenGrad)" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="76" letter-spacing="-2">C</text>
      <!-- Sparkle -->
      <path d="M150 25 Q150 40 165 40 Q150 40 150 55 Q150 40 135 40 Q150 40 150 25 Z" fill="#FDE047"/>
    </g>
  </g>

  <!-- Bottom Accent Ribbon / VIP Emblem Badge -->
  <g transform="translate(146, 440)">
    <rect width="220" height="42" rx="21" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="2"/>
    <text x="110" y="27" text-anchor="middle" fill="#FDE047" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" letter-spacing="3">RESELLER PORTAL</text>
  </g>
</svg>
`;

// 2. Play Store Feature Graphic (1024x500 PNG)
const playStoreFeatureGraphicSvg = `
<svg width="1024" height="500" viewBox="0 0 1024 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fgBg" x1="0" y1="0" x2="1024" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
    <linearGradient id="greenText" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6EE7B7"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <radialGradient id="heroGlow" cx="75%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#047857" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="goldGlow" cx="25%" cy="30%" r="40%">
      <stop offset="0%" stop-color="#EAB308" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="500" fill="url(#fgBg)"/>
  <rect width="1024" height="500" fill="url(#heroGlow)"/>
  <rect width="1024" height="500" fill="url(#goldGlow)"/>

  <!-- High-Tech Grid & Curved Growth Chart Lines -->
  <g opacity="0.25">
    <line x1="0" y1="100" x2="1024" y2="100" stroke="#334155" stroke-width="1" stroke-dasharray="8 8"/>
    <line x1="0" y1="200" x2="1024" y2="200" stroke="#334155" stroke-width="1" stroke-dasharray="8 8"/>
    <line x1="0" y1="300" x2="1024" y2="300" stroke="#334155" stroke-width="1" stroke-dasharray="8 8"/>
    <line x1="0" y1="400" x2="1024" y2="400" stroke="#334155" stroke-width="1" stroke-dasharray="8 8"/>
  </g>

  <!-- Glowing Trendline in Background -->
  <path d="M 50 420 Q 250 380 450 310 T 750 180 T 1000 80" stroke="url(#greenText)" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M 50 420 Q 250 380 450 310 T 750 180 T 1000 80 L 1000 500 L 50 500 Z" fill="url(#greenText)" opacity="0.05"/>

  <!-- Left Side: Brand Typography & Selling Points -->
  <g transform="translate(64, 90)">
    <!-- Pill Badge -->
    <rect width="210" height="34" rx="17" fill="#1E293B" stroke="#10B981" stroke-width="1.5" stroke-opacity="0.6"/>
    <circle cx="18" cy="17" r="5" fill="#10B981"/>
    <text x="32" y="22" fill="#E2E8F0" font-family="system-ui, sans-serif" font-weight="700" font-size="12" letter-spacing="1.5">OFFICIAL MERCHANT APP</text>

    <!-- Main Title -->
    <text x="0" y="90" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="46" letter-spacing="-1">GlobalCart</text>
    <text x="250" y="90" fill="url(#goldText)" font-family="system-ui, sans-serif" font-weight="900" font-size="46" letter-spacing="-1">OS</text>
    <text x="0" y="145" fill="url(#greenText)" font-family="system-ui, sans-serif" font-weight="800" font-size="40" letter-spacing="-0.5">Reseller Portal</text>

    <!-- Subtitle / Tagline -->
    <text x="0" y="195" fill="#94A3B8" font-family="system-ui, sans-serif" font-weight="500" font-size="18">
      Launch, automate &amp; scale your e-commerce store worldwide.
    </text>

    <!-- 3 Feature Badges -->
    <g transform="translate(0, 235)">
      <!-- Badge 1: 0 Inventory -->
      <g>
        <rect width="135" height="38" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="15" y="24" fill="#FDE047" font-family="system-ui, sans-serif" font-weight="700" font-size="13">⚡ 0 Inventory</text>
      </g>
      <!-- Badge 2: VIP Profits -->
      <g transform="translate(145, 0)">
        <rect width="145" height="38" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="15" y="24" fill="#34D399" font-family="system-ui, sans-serif" font-weight="700" font-size="13">💎 Up to 40% Margin</text>
      </g>
      <!-- Badge 3: Fast Payouts -->
      <g transform="translate(300, 0)">
        <rect width="130" height="38" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="15" y="24" fill="#60A5FA" font-family="system-ui, sans-serif" font-weight="700" font-size="13">🚀 Daily Payouts</text>
      </g>
    </g>
  </g>

  <!-- Right Side: 3D App Showcase Icon & Card Mockup -->
  <g transform="translate(680, 70)">
    <!-- Glow Backdrop -->
    <circle cx="160" cy="180" r="160" fill="#10B981" opacity="0.2" filter="blur(30px)"/>

    <!-- Floating Glass KPI Card Mockup -->
    <rect x="-40" y="220" width="220" height="110" rx="18" fill="#0F172A" fill-opacity="0.95" stroke="#334155" stroke-width="1.5"/>
    <text x="-20" y="250" fill="#94A3B8" font-family="system-ui, sans-serif" font-weight="600" font-size="12">TODAY'S TURNOVER</text>
    <text x="-20" y="285" fill="#34D399" font-family="system-ui, sans-serif" font-weight="900" font-size="28">$18,420.50</text>
    <text x="-20" y="312" fill="#FDE047" font-family="system-ui, sans-serif" font-weight="700" font-size="12">▲ +24.8% sales growth</text>

    <!-- Central 3D Icon Graphic -->
    <g transform="translate(60, 20) scale(0.6)">
      <!-- Main Cart -->
      <path d="M70 160 H125 L160 310 Q164 322 178 322 H330 Q344 322 348 310 L378 195 Q382 180 365 180 H140" 
            stroke="url(#goldText)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="175" cy="385" r="32" fill="#0F172A" stroke="url(#goldText)" stroke-width="14"/>
      <circle cx="175" cy="385" r="12" fill="#10B981"/>
      <circle cx="335" cy="385" r="32" fill="#0F172A" stroke="url(#goldText)" stroke-width="14"/>
      <circle cx="335" cy="385" r="12" fill="#10B981"/>

      <!-- Store & Box -->
      <rect x="170" y="190" width="95" height="110" rx="16" fill="#10B981"/>
      <rect x="250" y="210" width="90" height="95" rx="14" fill="url(#goldText)"/>
      <path d="M295 210 V305 M250 257 H340" stroke="#78350F" stroke-width="5" stroke-opacity="0.4"/>
      
      <!-- Big G C -->
      <text x="210" y="130" fill="url(#goldText)" font-family="sans-serif" font-weight="900" font-size="90">G</text>
      <text x="280" y="130" fill="url(#greenText)" font-family="sans-serif" font-weight="900" font-size="90">C</text>
    </g>
  </g>
</svg>
`;

// 3. Horizontal Full Lockup Logo (Dark & Light)
const logoHorizontalDarkSvg = `
<svg width="480" height="120" viewBox="0 0 480 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cart Mark -->
  <g transform="translate(10, 10) scale(0.8)">
    <line x1="5" y1="28" x2="22" y2="28" stroke="#EAB308" stroke-width="6" stroke-linecap="round"/>
    <line x1="22" y1="28" x2="32" y2="48" stroke="#EAB308" stroke-width="6" stroke-linecap="round"/>
    <path d="M28 48 L98 48 Q100 48 99 52 L89 82 Q88 85 85 85 L39 85 Q36 85 35 82 L27 52 Q26 48 28 48 Z" stroke="#EAB308" stroke-width="5.5" stroke-linejoin="round" fill="none"/>
    <circle cx="46" cy="100" r="9" stroke="#EAB308" stroke-width="5" fill="#0F172A"/>
    <circle cx="78" cy="100" r="9" stroke="#EAB308" stroke-width="5" fill="#0F172A"/>
    <rect x="45" y="64" width="14" height="17" rx="2" fill="#10B981"/>
    <rect x="57" y="68" width="11" height="13" rx="1.5" fill="#EAB308"/>
    <text x="56" y="52" fill="#EAB308" font-family="system-ui, sans-serif" font-weight="900" font-size="52" transform="rotate(-20, 56, 52)">G</text>
    <text x="86" y="52" fill="#10B981" font-family="system-ui, sans-serif" font-weight="900" font-size="52" transform="rotate(-20, 86, 52)">C</text>
  </g>
  <!-- Text Lockup -->
  <text x="130" y="58" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.5">GlobalCart</text>
  <text x="300" y="58" fill="#EAB308" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.5">OS</text>
  <text x="132" y="88" fill="#10B981" font-family="system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="3">RESELLER PORTAL</text>
</svg>
`;

const logoHorizontalLightSvg = `
<svg width="480" height="120" viewBox="0 0 480 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(10, 10) scale(0.8)">
    <line x1="5" y1="28" x2="22" y2="28" stroke="#CA8A04" stroke-width="6" stroke-linecap="round"/>
    <line x1="22" y1="28" x2="32" y2="48" stroke="#CA8A04" stroke-width="6" stroke-linecap="round"/>
    <path d="M28 48 L98 48 Q100 48 99 52 L89 82 Q88 85 85 85 L39 85 Q36 85 35 82 L27 52 Q26 48 28 48 Z" stroke="#CA8A04" stroke-width="5.5" stroke-linejoin="round" fill="none"/>
    <circle cx="46" cy="100" r="9" stroke="#CA8A04" stroke-width="5" fill="#FFFFFF"/>
    <circle cx="78" cy="100" r="9" stroke="#CA8A04" stroke-width="5" fill="#FFFFFF"/>
    <rect x="45" y="64" width="14" height="17" rx="2" fill="#059669"/>
    <rect x="57" y="68" width="11" height="13" rx="1.5" fill="#CA8A04"/>
    <text x="56" y="52" fill="#CA8A04" font-family="system-ui, sans-serif" font-weight="900" font-size="52" transform="rotate(-20, 56, 52)">G</text>
    <text x="86" y="52" fill="#059669" font-family="system-ui, sans-serif" font-weight="900" font-size="52" transform="rotate(-20, 86, 52)">C</text>
  </g>
  <text x="130" y="58" fill="#0F172A" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.5">GlobalCart</text>
  <text x="300" y="58" fill="#CA8A04" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.5">OS</text>
  <text x="132" y="88" fill="#059669" font-family="system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="3">RESELLER PORTAL</text>
</svg>
`;

// Adaptive Icon Foreground (Transparent with Cart Mark)
const adaptiveForegroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="50" y1="50" x2="380" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
    <linearGradient id="green" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <g transform="translate(68, 55) scale(2.5)">
    <line x1="5" y1="28" x2="22" y2="28" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
    <line x1="22" y1="28" x2="32" y2="48" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 48 L98 48 Q100 48 99 52 L89 82 Q88 85 85 85 L39 85 Q36 85 35 82 L27 52 Q26 48 28 48 Z" stroke="url(#gold)" stroke-width="4.5" stroke-linejoin="round" fill="none"/>
    <circle cx="46" cy="100" r="8" stroke="url(#gold)" stroke-width="4" fill="#0F172A"/>
    <circle cx="78" cy="100" r="8" stroke="url(#gold)" stroke-width="4" fill="#0F172A"/>
    <rect x="45" y="64" width="14" height="17" rx="2" fill="url(#green)"/>
    <rect x="57" y="68" width="11" height="13" rx="1.5" fill="url(#gold)"/>
    <text x="62" y="56" fill="url(#gold)" font-family="sans-serif" font-weight="900" font-size="54" transform="rotate(-30, 62, 56)">G</text>
    <text x="97" y="56" fill="url(#green)" font-family="sans-serif" font-weight="900" font-size="54" transform="rotate(-30, 97, 56)">C</text>
  </g>
</svg>
`;

const adaptiveBackgroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="abg" x1="0" y1="0" x2="432" y2="432" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0A0F1D"/>
    </linearGradient>
  </defs>
  <rect width="432" height="432" fill="url(#abg)"/>
</svg>
`;

async function main() {
  console.log("Generating Google Play Store and Logo Pack assets...");

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(BRAND_DIR, { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "android", "res", "mipmap-mdpi"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "android", "res", "mipmap-hdpi"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "android", "res", "mipmap-xhdpi"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "android", "res", "mipmap-xxhdpi"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "android", "res", "mipmap-xxxhdpi"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "store_listing"), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, "logos"), { recursive: true });

  const iconBuffer = Buffer.from(playStoreIconSvg);
  const featureBuffer = Buffer.from(playStoreFeatureGraphicSvg);
  const logoDarkBuffer = Buffer.from(logoHorizontalDarkSvg);
  const logoLightBuffer = Buffer.from(logoHorizontalLightSvg);
  const fgBuffer = Buffer.from(adaptiveForegroundSvg);
  const bgBuffer = Buffer.from(adaptiveBackgroundSvg);

  // 1. Google Play Store 512x512 Hi-Res Icon
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(OUTPUT_DIR, "store_listing", "playstore-icon-512x512.png"));
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(BRAND_DIR, "icon-512.png"));
  await sharp(iconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(BRAND_DIR, "icon-192.png"));

  // 2. Google Play Store 1024x500 Feature Graphic
  await sharp(featureBuffer)
    .resize(1024, 500)
    .png()
    .toFile(path.join(OUTPUT_DIR, "store_listing", "playstore-feature-graphic-1024x500.png"));
  await fs.writeFile(path.join(OUTPUT_DIR, "store_listing", "playstore-feature-graphic-1024x500.svg"), playStoreFeatureGraphicSvg);

  // 3. Android Mipmap Icons
  const mipmapSizes = [
    { dir: "mipmap-mdpi", size: 48 },
    { dir: "mipmap-hdpi", size: 72 },
    { dir: "mipmap-xhdpi", size: 96 },
    { dir: "mipmap-xxhdpi", size: 144 },
    { dir: "mipmap-xxxhdpi", size: 192 },
  ];

  for (const { dir, size } of mipmapSizes) {
    const targetPath = path.join(OUTPUT_DIR, "android", "res", dir);
    // Square Launcher
    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(targetPath, "ic_launcher.png"));
    
    // Round Launcher (circular mask)
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );
    await sharp(iconBuffer)
      .resize(size, size)
      .composite([{ input: circleMask, blend: "dest-in" }])
      .png()
      .toFile(path.join(targetPath, "ic_launcher_round.png"));
  }

  // 4. Adaptive Icons XML & SVGs
  await fs.writeFile(path.join(OUTPUT_DIR, "android", "ic_launcher_foreground.svg"), adaptiveForegroundSvg);
  await fs.writeFile(path.join(OUTPUT_DIR, "android", "ic_launcher_background.svg"), adaptiveBackgroundSvg);
  await sharp(fgBuffer).resize(432, 432).png().toFile(path.join(OUTPUT_DIR, "android", "ic_launcher_foreground.png"));
  await sharp(bgBuffer).resize(432, 432).png().toFile(path.join(OUTPUT_DIR, "android", "ic_launcher_background.png"));

  // 5. Logo Pack Files
  await fs.writeFile(path.join(OUTPUT_DIR, "logos", "logo-horizontal-dark.svg"), logoHorizontalDarkSvg);
  await fs.writeFile(path.join(OUTPUT_DIR, "logos", "logo-horizontal-light.svg"), logoHorizontalLightSvg);
  await fs.writeFile(path.join(OUTPUT_DIR, "logos", "logo-icon-mark.svg"), playStoreIconSvg);
  await sharp(logoDarkBuffer).resize(960, 240).png().toFile(path.join(OUTPUT_DIR, "logos", "logo-horizontal-dark.png"));
  await sharp(logoLightBuffer).resize(960, 240).png().toFile(path.join(OUTPUT_DIR, "logos", "logo-horizontal-light.png"));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(OUTPUT_DIR, "logos", "logo-mark-512x512.png"));

  // 6. Web / PWA Compliance Icons
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, "pwa-192x192.png"));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, "pwa-512x512.png"));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, "pwa-maskable-512x512.png"));
  await sharp(iconBuffer).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, "favicon-32x32.png"));
  await sharp(iconBuffer).resize(16, 16).png().toFile(path.join(PUBLIC_DIR, "favicon-16x16.png"));

  // 7. Metadata JSON for Google Play Console Submission
  const playStoreMetadata = {
    app_details: {
      app_name: "GCOS Reseller Portal",
      short_description: "Manage your online shop, orders, VIP profits and commissions on the go.",
      full_description: `GCOS Reseller Portal is the all-in-one mobile command center for digital store owners, e-commerce resellers, and dropshipping partners.

Key Features:
- 🚀 Zero Inventory Risk: Select verified high-demand catalog products with automated supplier fulfillment.
- 💎 Dynamic VIP Margin Tiers: Earn up to 40% profit margins with tiered VIP progression and reward structures.
- 📊 Real-time Analytics: Track your daily shop turnover, order states, store visits, and revenue streams live.
- ⚡ Instant Balance & Daily Payouts: Request rapid withdrawals directly to your crypto USDT wallet or bank account.
- 🔔 Real-Time Order Alerts: Instant push notifications whenever a new customer order or commission arrives.
- 🛠️ Store Customization: Personalize your storefront theme, custom banner, logo, and promotional discount campaigns.

Join thousands of global merchants scaling their online stores with GlobalCart OS.`,
      default_language: "en-US",
      category: "Shopping / Business",
      content_rating: "Everyone (PEGI 3 / ESRB Everyone)",
      privacy_policy_url: "https://globalcart-onlineshop.com/reseller/privacy",
      support_email: "support@globalcart-onlineshop.com",
      website_url: "https://globalcart-onlineshop.com/reseller",
    },
    asset_specifications_verified: {
      hi_res_icon: "512x512 32-bit PNG (Included in store_listing/playstore-icon-512x512.png)",
      feature_graphic: "1024x500 PNG / JPEG (Included in store_listing/playstore-feature-graphic-1024x500.png)",
      android_launcher_mipmaps: "mdpi (48px), hdpi (72px), xhdpi (96px), xxhdpi (144px), xxxhdpi (192px)",
      adaptive_icon: "Foreground 432x432 & Background 432x432 (Included in android/)",
    },
    trusted_web_activity: {
      package_name: "com.globalcart.reseller",
      start_url: "https://globalcart-onlineshop.com/reseller/",
      assetlinks_json_path: "/public/.well-known/assetlinks.json"
    }
  };

  await fs.writeFile(
    path.join(OUTPUT_DIR, "PLAYSTORE_METADATA.json"), 
    JSON.stringify(playStoreMetadata, null, 2)
  );

  // 8. Create ZIP bundle containing the entire Google Play Store & Logo Pack
  const zip = new JSZip();

  async function addFolderToZip(folderPath: string, zipFolder: JSZip) {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        const sub = zipFolder.folder(entry.name);
        if (sub) await addFolderToZip(fullPath, sub);
      } else {
        const fileData = await fs.readFile(fullPath);
        zipFolder.file(entry.name, fileData);
      }
    }
  }

  await addFolderToZip(OUTPUT_DIR, zip);
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await fs.writeFile(path.join(PUBLIC_DIR, "playstore-assets.zip"), zipBuffer);

  console.log("Play Store Asset Package generated successfully at /public/playstore and /public/playstore-assets.zip!");
}

main().catch(console.error);
