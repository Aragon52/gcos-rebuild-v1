'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { canInstallPWA, installPWA, isIOS, isPWAInstalled } from '@/lib/pwa-install';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner';
  className?: string;
}

export function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if PWA can be installed
    const checkInstall = () => {
      setCanInstall(canInstallPWA());
      setIsInstalled(isPWAInstalled());
    };

    checkInstall();

    // Listen for changes
    window.addEventListener('beforeinstallprompt', checkInstall);
    window.addEventListener('appinstalled', checkInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstall);
      window.removeEventListener('appinstalled', checkInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSPrompt(true);
      return;
    }

    setIsLoading(true);
    const success = await installPWA();
    setIsLoading(false);

    if (success) {
      setCanInstall(false);
    }
  };

  if (isInstalled || (!canInstall && !isIOS())) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`flex items-center justify-between gap-4 rounded-lg border border-border bg-accent/50 p-4 ${className}`}>
          <div className="flex items-center gap-3">
            <Download className="size-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Install app</p>
              <p className="text-xs text-muted-foreground">Get quick access from your home screen</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? 'Installing...' : 'Install'}
            </Button>
            <button
              onClick={() => setCanInstall(false)}
              className="p-1 hover:bg-background rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="rounded-lg bg-background p-6 max-w-sm">
              <h3 className="font-semibold text-lg mb-2">Install on iOS</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tap the share button at the bottom, then tap "Add to Home Screen" to install this app on your device.
              </p>
              <Button
                onClick={() => setShowIOSPrompt(false)}
                variant="outline"
                className="w-full"
              >
                Got it
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleInstall}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className={className}
      >
        <Download className="size-4 mr-2" />
        {isLoading ? 'Installing...' : isIOS() ? 'Install (iOS)' : 'Install App'}
      </Button>

      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-lg bg-background p-6 max-w-sm">
            <h3 className="font-semibold text-lg mb-2">Install on iOS</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the share button at the bottom, then tap "Add to Home Screen" to install this app on your device.
            </p>
            <Button
              onClick={() => setShowIOSPrompt(false)}
              variant="outline"
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
