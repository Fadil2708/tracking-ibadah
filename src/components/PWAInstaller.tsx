'use client';

import { useEffect, useState } from 'react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      (e as any).preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    
    (deferredPrompt as any).prompt = null;
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install Ibadah Tracker</h3>
          <p className="text-sm text-teal-100">
            Install untuk akses cepat & notifikasi pengingat ibadah
          </p>
        </div>
        <button
          onClick={() => setIsInstalled(true)}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <button
        onClick={handleInstall}
        className="mt-3 w-full bg-white text-teal-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-teal-50 transition-colors text-sm"
      >
        📱 Install Sekarang
      </button>
    </div>
  );
}
