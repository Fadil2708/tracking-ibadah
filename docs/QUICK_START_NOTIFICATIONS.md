# 🚀 Quick Start: Push Notification System

## Cara Menggunakan

### 1️⃣ First Time Setup (Untuk User)

Ketika user pertama kali buka aplikasi:

1. **Tunggu 3 detik** - Sistem akan otomatis minta izin notifikasi
2. **Click "Allow"** - Saat browser minta izin notifikasi
3. **Welcome notification** - Akan muncul notifikasi "🎉 Selamat Datang!"
4. **Install PWA** (optional) - Click "Install Sekarang" untuk install aplikasi

### 2️⃣ Configure Notifications

1. **Buka** `/settings/notifications` dari menu
2. **Enable** notifikasi jika belum
3. **Pilih sholat** yang ingin diingatkan:
   - ✅ Subuh (default ON)
   - ⬜ Dzuhur
   - ⬜ Ashar
   - ✅ Maghrib (default ON)
   - ⬜ Isya
4. **Set waktu** untuk pengingat input ibadah (default: 21:00)
5. **Set waktu** untuk pengingat streak (default: 20:00)
6. **Test** - Click "🔔 Test Notifikasi"

### 3️⃣ Daily Usage

Setelah setup, user akan dapat notifikasi otomatis:

```
Contoh jadwal (tergantung lokasi):
04:45 → ⏰ Waktu Subuh Tiba
12:00 → ⏰ Waktu Dzuhur Tiba (jika enabled)
15:30 → ⏰ Waktu Ashar Tiba (jika enabled)
18:00 → ⏰ Waktu Maghrib Tiba
20:00 → 🔥 Jaga Streak!
21:00 → 📝 Catat Ibadah Hari Ini
```

---

## 🔧 Developer Setup

### No Extra Setup Needed!

Sistem notifikasi ini **tidak perlu setup tambahan**:
- ❌ Tidak perlu VAPID keys
- ❌ Tidak perlu server push
- ❌ Tidak perlu cron jobs
- ✅ Semua berjalan di client-side

### Files Created

```
✅ src/lib/notificationScheduler.ts        # Main service
✅ src/components/NotificationSettings.tsx  # Settings UI
✅ public/sw-enhanced.js                    # Service worker
✅ docs/NOTIFICATION_SYSTEM.md              # Full documentation
```

### Integration Points

Sudah terintegrasi di:
- ✅ `src/app/page.tsx` - Schedule prayers on home page load
- ✅ `src/app/page.tsx` - Notify on badge earned
- ✅ `src/components/PWAInstaller.tsx` - Auto prompt permission
- ✅ `src/app/settings/notifications/page.tsx` - Settings page

---

## 🧪 Testing

### Quick Test

```bash
# 1. Run development server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Wait 3 seconds - should ask for notification permission

# 4. Go to settings
http://localhost:3000/settings/notifications

# 5. Enable notifications and click "Test Notifikasi"
```

### Manual Trigger

```javascript
// In browser console
import { notificationScheduler } from '@/lib/notificationScheduler'

// Send test notification
notificationScheduler.sendNotification({
  title: '🧪 Test',
  body: 'This is a test notification',
  tag: 'manual-test',
})

// Check scheduled count
notificationScheduler.getScheduledCount()

// Clear all scheduled
notificationScheduler.clearAllScheduled()
```

---

## ⚙️ Customization

### Change Default Times

Edit `src/lib/notificationScheduler.ts`:

```typescript
// Line ~95
ibadahReminder: {
  enabled: true,
  time: '21:00',  // ← Change to your preferred time
},
streakReminder: {
  enabled: true,
  time: '20:00',  // ← Change to your preferred time
},
```

### Change Default Prayers

Edit `src/lib/notificationScheduler.ts`:

```typescript
// Line ~88
prayerReminders: {
  subuh: true,     // ← Set to false to disable by default
  dzuhur: false,   // ← Set to true to enable by default
  ashar: false,
  maghrib: true,
  isya: false,
},
```

### Change Notification Messages

Edit methods in `src/lib/notificationScheduler.ts`:

```typescript
// Line ~210 - Prayer notification
this.sendNotification({
  title: `⏰ Waktu ${prayerName} Tiba`,
  body: `Saatnya menunaikan sholat ${prayerName}. Jangan lupa catat ibadahmu!`,
  // ...
})
```

---

## 📱 PWA Installation

### Chrome/Edge (Desktop)
1. Click icon di address bar (⊕ Install)
2. Click "Install"
3. App will open in standalone window

### Android Chrome
1. Tap menu (⋮) > "Add to Home screen"
2. Tap "Install"
3. App icon appears on home screen

### iOS Safari
1. Tap share button (⎋)
2. Tap "Add to Home Screen"
3. Tap "Add"

---

## 🎯 Next Steps

### Recommended Enhancements
1. **Add more notification types**
   - Quran verse of the day
   - Hadith notifications
   - Community challenges

2. **Smart scheduling**
   - Learn user behavior
   - Suggest optimal reminder times
   - Auto-adjust based on activity

3. **Server integration** (optional)
   - Store schedules in database
   - Cross-device sync
   - Admin announcements

---

## 🆘 Troubleshooting

### User Reports: "Notifikasi tidak muncul"

**Solution:**
1. Check permission: `Settings > Site Settings > Notifications`
2. Make sure schedule is enabled
3. Test with "Test Notifikasi" button
4. Check if app is running in background

### Developer: "TypeScript errors"

**Solution:**
```bash
# Rebuild TypeScript
npx tsc --noEmit

# If errors persist, clear cache
rm -rf .next
npm run dev
```

### "Service worker not registering"

**Solution:**
1. Make sure you're on HTTPS or localhost
2. Clear service worker cache in DevTools
3. Hard refresh (Ctrl+Shift+R)

---

## 📞 Support

Untuk pertanyaan atau issue:
1. Check `docs/NOTIFICATION_SYSTEM.md` untuk full documentation
2. Review code comments di `src/lib/notificationScheduler.ts`
3. Test dengan browser DevTools > Application > Notifications

---

**Ready to use! 🎉**

Tidak perlu setup tambahan. Sistem sudah terintegrasi dan siap digunakan.

User tinggal:
1. Buka aplikasi
2. Allow notification permission
3. Configure di settings
4. Enjoy automatic reminders! 🕌
