'use client';

import { useEffect, useState } from 'react';
import { notificationScheduler } from '@/lib/notificationScheduler';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Request notification permission on first visit
  useEffect(() => {
    if (!isInstalled && 'Notification' in window && Notification.permission === 'default') {
      // Wait 3 seconds after page load, then ask for permission
      const timer = setTimeout(async () => {
        const granted = await notificationScheduler.requestPermission();
        if (granted) {
          setNotificationsEnabled(true);
          // Show welcome notification
          notificationScheduler.sendNotification({
            title: '🎉 Selamat Datang!',
            body: 'Notifikasi berhasil diaktifkan. Kamu akan mendapat pengingat ibadah.',
            tag: 'welcome',
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

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

  if (isInstalled && notificationsEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            {!isInstalled ? 'Install Ibadah Tracker' : 'Aktifkan Notifikasi'}
          </h3>
          <p className="text-sm text-teal-100">
            {!isInstalled
              ? 'Install untuk akses cepat & pengingat ibadah'
              : 'Nyalakan notifikasi untuk pengingat sholat & ibadah'}
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
      <div className="mt-3 space-y-2">
        {!isInstalled && (
          <button
            onClick={handleInstall}
            className="w-full bg-white text-teal-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            📱 Install Sekarang
          </button>
        )}
        {!notificationsEnabled && (
          <button
            onClick={async () => {
              const granted = await notificationScheduler.requestPermission();
              if (granted) {
                setNotificationsEnabled(true);
                notificationScheduler.sendNotification({
                  title: '✅ Notifikasi Aktif',
                  body: 'Kamu akan mendapat pengingat ibadah harian',
                  tag: 'notification-enabled',
                });
              }
            }}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm border border-white/30"
          >
            🔔 Aktifkan Notifikasi
          </button>
        )}
      </div>
    </div>
  );
}
