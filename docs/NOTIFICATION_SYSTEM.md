# 🔔 Push Notification System

Sistem notifikasi lokal untuk pengingat ibadah dan waktu sholat. Tidak memerlukan server push (VAPID) - semuanya berjalan di client-side.

## ✨ Fitur

### 1. **Pengingat Waktu Sholat**
- Notifikasi otomatis saat waktu sholat tiba
- Berdasarkan lokasi user (menggunakan adhan library)
- Bisa pilih sholat mana yang mau diingatkan:
  - Subuh 🌅
  - Dzuhur ☀️
  - Ashar 🌇
  - Maghrib 🌆
  - Isya 🌙

### 2. **Pengingat Input Ibadah**
- Reminder harian untuk mencatat ibadah
- Default: 21:00 (9 PM)
- Bisa custom waktu
- Pesan: "Sudah sholat tahajud? Istigfar berapa kali? Yuk catat sebelum tidur!"

### 3. **Pengingat Streak**
- Reminder untuk menjaga streak ibadah
- Default: 20:00 (8 PM)
- Pesan: "Streak ibadah kamu sedang bagus. Jangan sampai putus hari ini!"

### 4. **Notifikasi Achievement**
- Otomatis saat mendapat badge baru
- Pesan: "🎉 Pencapaian Baru! Selamat! Kamu mendapat badge: [nama badge]"

### 5. **Early Bird Reminder**
- Notifikasi jika upload subuh sebelum 5:30 AM
- Badge: 🐦 Early Bird

---

## 📂 File Structure

```
src/
├── lib/
│   ├── notificationScheduler.ts  # Main notification service
│   └── pushNotification.ts       # Legacy push notification service
├── components/
│   ├── NotificationSettings.tsx  # Settings UI component
│   └── PWAInstaller.tsx          # PWA install + notification prompt
└── app/
    └── settings/notifications/
        └── page.tsx              # Settings page
public/
└── sw-enhanced.js                # Enhanced service worker
```

---

## 🚀 Cara Kerja

### Permission Flow
```
User visits site
  ↓
Wait 3 seconds
  ↓
Request Notification permission
  ↓
If granted → Show welcome notification
  ↓
Load schedule from localStorage
  ↓
Calculate prayer times based on location
  ↓
Schedule notifications with setTimeout
```

### Scheduling System
```typescript
// Example: Schedule Subuh reminder
const subuhTime = new Date(); // e.g., 04:45
const now = new Date();
const timeUntilSubuh = subuhTime.getTime() - now.getTime();

setTimeout(() => {
  sendNotification({
    title: '⏰ Waktu Subuh Tiba',
    body: 'Saatnya menunaikan sholat Subuh...',
    tag: 'prayer-subuh',
  });
}, timeUntilSubuh);
```

### Service Worker Integration
```javascript
// Show notification from service worker
self.registration.showNotification('Title', {
  body: 'Message',
  icon: '/icons/icon-192x192.png',
  tag: 'unique-tag',
  data: { url: '/' },
});
```

---

## ⚙️ Configuration

### Default Schedule
```typescript
{
  enabled: false,
  prayerReminders: {
    subuh: true,      // Default: ON
    dzuhur: false,
    ashar: false,
    maghrib: true,    // Default: ON
    isya: false,
  },
  ibadahReminder: {
    enabled: true,    // Default: ON
    time: '21:00',
  },
  streakReminder: {
    enabled: true,    // Default: ON
    time: '20:00',
  },
  earlyBirdReminder: {
    enabled: true,    // Default: ON
  },
}
```

### Storage
- Schedule disimpan di `localStorage` dengan key: `notification_schedule`
- Format: JSON

---

## 🎨 UI Components

### 1. PWAInstaller (Auto Prompt)
- Muncul saat pertama kali visit
- 2 CTA: Install App + Enable Notifications
- Auto-request permission after 3 seconds

### 2. NotificationSettings Page
- Toggle utama ON/OFF
- Prayer time grid (5 sholat) dengan waktu & emoji
- Time picker untuk ibadah & streak reminder
- Test notification button
- Status indicator (green dot if active)

---

## 📱 User Journey

### First Visit
```
1. User buka aplikasi
2. Wait 3 seconds
3. Browser asks: "Show notifications?"
4. User clicks "Allow"
5. Welcome notification appears: "🎉 Selamat Datang!"
6. PWA Installer shows (if not installed)
```

### Daily Usage
```
Morning:
- 04:45 → "⏰ Waktu Subuh Tiba"
- 05:30 → Early Bird notification (if uploaded subuh)

Day:
- 12:00 → "⏰ Waktu Dzuhur Tiba" (if enabled)
- 15:30 → "⏰ Waktu Ashar Tiba" (if enabled)
- 18:00 → "⏰ Waktu Maghrib Tiba"

Night:
- 20:00 → "🔥 Jaga Streak!"
- 21:00 → "📝 Catat Ibadah Hari Ini"

Achievement:
- Anytime → "🎉 Pencapaian Baru!"
```

---

## 🔧 API Reference

### `notificationScheduler`

```typescript
// Check if supported
notificationScheduler.isSupported(): boolean

// Get permission status
notificationScheduler.getPermission(): NotificationPermission

// Request permission
await notificationScheduler.requestPermission(): Promise<boolean>

// Load schedule
const schedule = notificationScheduler.loadSchedule(): NotificationSchedule

// Save schedule
notificationScheduler.saveSchedule(schedule: NotificationSchedule): void

// Send notification now
notificationScheduler.sendNotification({
  title: 'Title',
  body: 'Message',
  tag: 'unique-tag',
  data: { url: '/' }
}): void

// Schedule all notifications
notificationScheduler.scheduleAll(prayerTimes): void

// Notify achievement
notificationScheduler.notifyAchievement(badgeName: string, badgeIcon: string): void

// Clear all scheduled
notificationScheduler.clearAllScheduled(): void
```

---

## 🧪 Testing

### Manual Test
1. Buka `/settings/notifications`
2. Enable notifications
3. Click "Test Notifikasi"
4. Should show notification with title "🔔 Test Notifikasi"

### Prayer Time Test
```typescript
// In browser console
import { notificationScheduler } from '@/lib/notificationScheduler'

// Send test prayer notification
notificationScheduler.sendNotification({
  title: '⏰ Waktu Subuh Tiba',
  body: 'Test notification',
  tag: 'test-subuh',
})
```

---

## ⚠️ Troubleshooting

### Notifications not showing?
1. Check permission: `Notification.permission` (should be 'granted')
2. Check schedule: `localStorage.getItem('notification_schedule')`
3. Check if timers are set: `notificationScheduler.getScheduledCount()`

### Permission denied?
- User harus enable manual di browser settings:
  - Chrome: `Settings > Privacy and security > Site settings > Notifications`
  - Safari: `Preferences > Websites > Notifications`

### Service worker not working?
- Clear service worker: `DevTools > Application > Service Workers > Unregister`
- Hard refresh: `Ctrl+Shift+R`

---

## 🎯 Future Enhancements

### Phase 2 (Server Push - Optional)
- [ ] Implement VAPID for server push
- [ ] Store push subscriptions in database
- [ ] Cron job for scheduled server notifications
- [ ] Fallback to server push if app not open

### Phase 3 (Advanced)
- [ ] Smart reminders based on user behavior
- [ ] Quran verse of the day notifications
- [ ] Hadith of the week
- [ ] Community challenges notifications
- [ ] Ramadan mode with different schedule

---

## 📝 Notes

- **No server required** - Semua berjalan di client
- **Privacy-friendly** - Data schedule di localStorage user
- **Battery efficient** - Menggunakan setTimeout (native browser API)
- **PWA compatible** - Bekerja di installed app
- **Offline capable** - Schedule tetap berjalan tanpa internet

---

## 🤝 Contributing

Untuk menambah jenis notifikasi baru:

1. Tambahkan ke `NotificationSchedule` interface
2. Update default schedule di `loadSchedule()`
3. Tambahkan scheduler method
4. Update UI di `NotificationSettings.tsx`

Contoh tambah notifikasi baru:

```typescript
// 1. Add to interface
export interface NotificationSchedule {
  // ... existing fields
  jumatReminder: {
    enabled: boolean;
    time: string;
  };
}

// 2. Add to default schedule
jumatReminder: {
  enabled: true,
  time: '06:00',
}

// 3. Create scheduler
private scheduleJumatReminder(time: string): void {
  // ... scheduling logic
  this.sendNotification({
    title: '🕌 Hari Jumat',
    body: 'Hari ini hari Jumat. Jangan lupa sholat Jumat dan baca surat Al-Kahfi!',
    tag: 'jumat-reminder',
  });
}

// 4. Add to UI
<div>
  <h4>Pengingat Hari Jumat</h4>
  {/* toggle + time picker */}
</div>
```

---

**Last Updated**: 2026-04-16
**Version**: 1.0.0
