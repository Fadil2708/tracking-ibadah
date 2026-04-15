'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/lib/pushNotification';

export function NotificationSettings() {
  const { permission, isSubscribed, subscribe, unsubscribe, isSupported, sendNotification } = usePushNotifications();
  const [showTestNotification, setShowTestNotification] = useState(false);

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      setShowTestNotification(true);
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribe();
  };

  const handleTestNotification = () => {
    sendNotification({
      title: 'Ibadah Tracker',
      body: 'Notifikasi berhasil! Kamu akan menerima pengingat ibadah.',
      tag: 'test-notification',
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          Browser kamu tidak mendukung push notification. Tetap bisa menggunakan fitur offline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Notifikasi</h3>
              <p className="text-teal-100 text-xs">Pengingat ibadah harian</p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-white' : 'bg-white/30'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                isSubscribed ? 'translate-x-6 bg-teal-600' : 'translate-x-1 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-gray-700">
              {isSubscribed ? 'Notifikasi aktif' : permission === 'denied' ? 'Izin ditolak' : 'Belum diaktifkan'}
            </span>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
            <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Pengingat Sholat</p>
              <p className="text-xs text-gray-600">Notifikasi otomatis saat waktu sholat tiba</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
            <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Pengingat Ibadah</p>
              <p className="text-xs text-gray-600">Reminder untuk mencatat ibadah harian</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
            <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Streak Reminder</p>
              <p className="text-xs text-gray-600">Jangan lewatkan streak ibadah harianmu</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isSubscribed && (
          <button
            onClick={handleTestNotification}
            className="w-full py-2.5 px-4 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors text-sm"
          >
            Test Notifikasi
          </button>
        )}

        {/* Permission Denied Notice */}
        {permission === 'denied' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              Izin notifikasi ditolak. Kamu bisa mengaktifkannya di pengaturan browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
