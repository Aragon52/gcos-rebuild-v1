/**
 * PWA Install Utility
 * Manages beforeinstallprompt event and PWA installation flow
 */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: InstallPromptEvent | null = null;

export function initPWAInstall() {
  if (typeof window === 'undefined') return;

  // Capture the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
  });

  // Clean up if app is already installed
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) return false;

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[v0] PWA install error:', error);
    return false;
  }
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for standalone mode (installed)
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true;
  }

  // Check for display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  return false;
}
