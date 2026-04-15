'use client';

import { useState, useEffect } from 'react';
import { notificationScheduler, NotificationSchedule } from '@/lib/notificationScheduler';
import { calculatePrayerTimes } from '@/lib/prayerTime';

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    enabled: false,
    prayerReminders: {
      subuh: true,
      dzuhur: false,
      ashar: false,
      maghrib: true,
      isya: false,
    },
    ibadahReminder: {
      enabled: true,
      time: '21:00',
    },
    streakReminder: {
      enabled: true,
      time: '20:00',
    },
    earlyBirdReminder: {
      enabled: true,
    },
  });
  const [showTestNotification, setShowTestNotification] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  useEffect(() => {
    if (!notificationScheduler.isSupported()) return;
    
    setPermission(notificationScheduler.getPermission());
    const savedSchedule = notificationScheduler.loadSchedule();
    setSchedule(savedSchedule);

    // Get user location for prayer times
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);

          // Calculate prayer times
          const times = calculatePrayerTimes(coords.lat, coords.lng, new Date());
          setPrayerTimes(times);
        },
        (error) => {
          console.warn('Location error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Reschedule notifications when schedule changes
    if (permission === 'granted' && schedule.enabled && prayerTimes) {
      notificationScheduler.scheduleAll(prayerTimes);
    }
  }, [schedule, permission, prayerTimes]);

  const handleEnableNotifications = async () => {
    const success = await notificationScheduler.requestPermission();
    if (success) {
      setPermission('granted');
      setSchedule({ ...schedule, enabled: true });
      notificationScheduler.saveSchedule({ ...schedule, enabled: true });
      setShowTestNotification(true);
    }
  };

  const handleDisableNotifications = async () => {
    notificationScheduler.clearAllScheduled();
    const updatedSchedule = { ...schedule, enabled: false };
    setSchedule(updatedSchedule);
    notificationScheduler.saveSchedule(updatedSchedule);
  };

  const handleTestNotification = () => {
    notificationScheduler.sendNotification({
      title: '🔔 Test Notifikasi',
      body: 'Notifikasi berhasil! Kamu akan menerima pengingat ibadah.',
      tag: 'test-notification',
    });
  };

  const updateSchedule = (updates: Partial<NotificationSchedule>) => {
    const updatedSchedule = { ...schedule, ...updates };
    setSchedule(updatedSchedule);
    notificationScheduler.saveSchedule(updatedSchedule);
  };

  const updatePrayerReminder = (prayer: string, enabled: boolean) => {
    const updatedPrayers = { ...schedule.prayerReminders, [prayer]: enabled };
    updateSchedule({ prayerReminders: updatedPrayers });
  };

  if (!notificationScheduler.isSupported()) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            Browser kamu tidak mendukung notifikasi. Tetap bisa menggunakan fitur offline.
          </p>
        </div>
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
            onClick={schedule.enabled ? handleDisableNotifications : handleEnableNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              schedule.enabled ? 'bg-white' : 'bg-white/30'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                schedule.enabled ? 'translate-x-6 bg-teal-600' : 'translate-x-1 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            schedule.enabled && permission === 'granted' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-gray-700">
            {schedule.enabled && permission === 'granted'
              ? 'Notifikasi aktif'
              : permission === 'denied'
              ? 'Izin ditolak'
              : 'Belum diaktifkan'}
          </span>
        </div>

        {/* Prayer Time Reminders */}
        {schedule.enabled && prayerTimes && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Pengingat Waktu Sholat</h4>
            <p className="text-xs text-gray-600 mb-3">Pilih sholat yang ingin diingatkan:</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'subuh', label: 'Subuh', time: prayerTimes.subuh, emoji: '🌅' },
                { key: 'dzuhur', label: 'Dzuhur', time: prayerTimes.dzuhur, emoji: '☀️' },
                { key: 'ashar', label: 'Ashar', time: prayerTimes.ashar, emoji: '🌇' },
                { key: 'maghrib', label: 'Maghrib', time: prayerTimes.maghrib, emoji: '🌆' },
                { key: 'isya', label: 'Isya', time: prayerTimes.isya, emoji: '🌙' },
              ].map(({ key, label, time, emoji }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                    (schedule.prayerReminders as any)[key]
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{label}</p>
                      <p className="text-xs text-gray-600">{time?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(schedule.prayerReminders as any)[key]}
                    onChange={(e) => updatePrayerReminder(key, e.target.checked)}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Ibadah Reminder */}
        {schedule.enabled && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Pengingat Input Ibadah</h4>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-900">Pengingat Malam</p>
                <p className="text-xs text-gray-600">Ingatkan untuk catat ibadah sebelum tidur</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={schedule.ibadahReminder.time}
                  onChange={(e) =>
                    updateSchedule({
                      ibadahReminder: { ...schedule.ibadahReminder, time: e.target.value },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="checkbox"
                  checked={schedule.ibadahReminder.enabled}
                  onChange={(e) =>
                    updateSchedule({
                      ibadahReminder: { ...schedule.ibadahReminder, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            </label>
          </div>
        )}

        {/* Streak Reminder */}
        {schedule.enabled && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Pengingat Streak</h4>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-900">Jaga Streak</p>
                <p className="text-xs text-gray-600">Ingatkan jika belum input hari ini</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={schedule.streakReminder.time}
                  onChange={(e) =>
                    updateSchedule({
                      streakReminder: { ...schedule.streakReminder, time: e.target.value },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="checkbox"
                  checked={schedule.streakReminder.enabled}
                  onChange={(e) =>
                    updateSchedule({
                      streakReminder: { ...schedule.streakReminder, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            </label>
          </div>
        )}

        {/* Test Button */}
        {schedule.enabled && permission === 'granted' && (
          <button
            onClick={handleTestNotification}
            className="w-full py-2.5 px-4 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors text-sm"
          >
            🔔 Test Notifikasi
          </button>
        )}

        {/* Permission Denied Notice */}
        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              Izin notifikasi ditolak. Kamu bisa mengaktifkannya di pengaturan browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
