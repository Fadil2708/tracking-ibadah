// Enhanced Notification Scheduler for Ibadah Tracker
// Handles local scheduling of prayer reminders and ibadah notifications

export interface NotificationSchedule {
  enabled: boolean;
  prayerReminders: {
    subuh: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  ibadahReminder: {
    enabled: boolean;
    time: string; // HH:MM format
  };
  streakReminder: {
    enabled: boolean;
    time: string; // HH:MM format
  };
  earlyBirdReminder: {
    enabled: boolean;
  };
}

export interface ScheduledNotification {
  id: string;
  type: 'prayer' | 'ibadah' | 'streak' | 'achievement';
  title: string;
  body: string;
  scheduledTime: Date;
  repeat?: 'daily' | 'weekly';
  icon?: string;
  data?: any;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private scheduledTimers: Map<string, NodeJS.Timeout> = new Map();
  private schedule: NotificationSchedule | null = null;

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get notification permission
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  // Load schedule from localStorage
  loadSchedule(): NotificationSchedule {
    if (this.schedule) return this.schedule;

    try {
      const saved = localStorage.getItem('notification_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.schedule = parsed;
        return parsed;
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }

    // Default schedule
    const defaultSchedule: NotificationSchedule = {
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
        time: '21:00', // 9 PM reminder to log ibadah
      },
      streakReminder: {
        enabled: true,
        time: '20:00', // 8 PM streak reminder
      },
      earlyBirdReminder: {
        enabled: true,
      },
    };

    return defaultSchedule;
  }

  // Save schedule to localStorage
  saveSchedule(schedule: NotificationSchedule): void {
    this.schedule = schedule;
    try {
      localStorage.setItem('notification_schedule', JSON.stringify(schedule));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  // Send a notification immediately
  sendNotification({
    title,
    body,
    icon,
    tag,
    data,
  }: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
    actions?: Array<{ action: string; title: string }>;
  }): void {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    // Use service worker for better control
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: icon || '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: tag || 'ibadah-notification',
          data: data || {},
          requireInteraction: true,
        } as NotificationOptions);
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        body,
        icon: icon || '/icons/icon-192x192.png',
        tag: tag || 'ibadah-notification',
        data: data || {},
      });
    }
  }

  // Schedule all notifications based on user preferences
  scheduleAll(prayerTimes?: {
    subuh: Date;
    dzuhur: Date;
    ashar: Date;
    maghrib: Date;
    isya: Date;
  }): void {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    const schedule = this.loadSchedule();
    
    // Clear existing timers
    this.clearAllScheduled();

    if (!schedule.enabled) return;

    // Schedule prayer reminders
    if (prayerTimes) {
      if (schedule.prayerReminders.subuh) {
        this.schedulePrayerNotification(prayerTimes.subuh, 'Subuh');
      }
      if (schedule.prayerReminders.dzuhur) {
        this.schedulePrayerNotification(prayerTimes.dzuhur, 'Dzuhur');
      }
      if (schedule.prayerReminders.ashar) {
        this.schedulePrayerNotification(prayerTimes.ashar, 'Ashar');
      }
      if (schedule.prayerReminders.maghrib) {
        this.schedulePrayerNotification(prayerTimes.maghrib, 'Maghrib');
      }
      if (schedule.prayerReminders.isya) {
        this.schedulePrayerNotification(prayerTimes.isya, 'Isya');
      }
    }

    // Schedule ibadah reminder
    if (schedule.ibadahReminder.enabled) {
      this.scheduleDailyReminder(schedule.ibadahReminder.time);
    }

    // Schedule streak reminder
    if (schedule.streakReminder.enabled) {
      this.scheduleStreakReminder(schedule.streakReminder.time);
    }
  }

  // Schedule prayer time notification
  private schedulePrayerNotification(prayerTime: Date, prayerName: string): void {
    const now = new Date();
    const timeUntilPrayer = prayerTime.getTime() - now.getTime();

    // If prayer time is in the future (within 24 hours)
    if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        this.sendNotification({
          title: `⏰ Waktu ${prayerName} Tiba`,
          body: `Saatnya menunaikan sholat ${prayerName}. Jangan lupa catat ibadahmu!`,
          tag: `prayer-${prayerName.toLowerCase()}`,
          data: {
            type: 'prayer_reminder',
            prayer: prayerName,
            url: '/',
          },
          actions: [
            { action: 'view', title: 'Catat Ibadah' },
            { action: 'close', title: 'Nanti' },
          ],
        });
      }, timeUntilPrayer);

      this.scheduledTimers.set(`prayer-${prayerName}`, timer);
    }
  }

  // Schedule daily ibadah reminder (e.g., 9 PM to log today's ibadah)
  private scheduleDailyReminder(time: string): void {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - new Date().getTime();

    const timer = setTimeout(() => {
      this.sendNotification({
        title: '📝 Catat Ibadah Hari Ini',
        body: 'Sudah sholat tahajud? Istigfar berapa kali? Yuk catat sebelum tidur!',
        tag: 'ibadah-reminder',
        data: {
          type: 'ibadah_reminder',
          url: '/',
        },
        actions: [
          { action: 'view', title: 'Catat Sekarang' },
          { action: 'close', title: 'Nanti' },
        ],
      });

      // Reschedule for next day
      this.scheduleDailyReminder(time);
    }, timeUntilReminder);

    this.scheduledTimers.set('ibadah-reminder', timer);
  }

  // Schedule streak reminder
  private scheduleStreakReminder(time: string): void {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - new Date().getTime();

    const timer = setTimeout(() => {
      this.sendNotification({
        title: '🔥 Jaga Streak!',
        body: 'Streak ibadah kamu sedang bagus. Jangan sampai putus hari ini!',
        tag: 'streak-reminder',
        data: {
          type: 'streak_reminder',
          url: '/history',
        },
        actions: [
          { action: 'view', title: 'Lihat Progress' },
          { action: 'close', title: 'Nanti' },
        ],
      });

      // Reschedule for next day
      this.scheduleStreakReminder(time);
    }, timeUntilReminder);

    this.scheduledTimers.set('streak-reminder', timer);
  }

  // Send achievement notification
  notifyAchievement(badgeName: string, badgeIcon: string): void {
    this.sendNotification({
      title: '🎉 Pencapaian Baru!',
      body: `Selamat! Kamu mendapat badge: ${badgeName}`,
      tag: 'achievement',
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'achievement',
        badge: badgeName,
        url: '/achievements',
      },
      actions: [
        { action: 'view', title: 'Lihat Badge' },
        { action: 'close', title: 'Tutup' },
      ],
    });
  }

  // Clear all scheduled notifications
  clearAllScheduled(): void {
    this.scheduledTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.scheduledTimers.clear();
  }

  // Clear specific notification
  clearScheduled(id: string): void {
    const timer = this.scheduledTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.scheduledTimers.delete(id);
    }
  }

  // Get list of scheduled notifications
  getScheduledCount(): number {
    return this.scheduledTimers.size;
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();
