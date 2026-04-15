// Push Notification Service for Ibadah Tracker
// This service handles push notifications for prayer time reminders

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private subscription: PushSubscription | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check notification permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from environment or server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Send local notification (for testing or immediate alerts)
  sendLocalNotification({ title, body, icon, badge, data, tag }: NotificationPayload): void {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    const notificationOptions = {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      data,
      tag: tag || 'default',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Buka Dashboard' },
        { action: 'close', title: 'Tutup' },
      ],
    };

    const notification = new Notification(title, notificationOptions);

    notification.onclick = (event) => {
      event.preventDefault();
      const action = (event as any).action;
      
      if (action === 'view') {
        window.focus();
        if (data?.url) {
          window.location.href = data.url;
        }
      }
      
      notification.close();
    };
  }

  // Schedule prayer time reminders
  schedulePrayerReminder(prayerTime: string, prayerName: string): void {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    // Calculate time until prayer
    const prayer = new Date(prayerTime);
    const now = new Date();
    const timeUntilPrayer = prayer.getTime() - now.getTime();

    if (timeUntilPrayer > 0) {
      setTimeout(() => {
        this.sendLocalNotification({
          title: `Waktu ${prayerName} Tiba`,
          body: `Saatnya menunaikan sholat ${prayerName}. Jangan lupa catat ibadahmu!`,
          tag: `prayer-${prayerName.toLowerCase()}`,
          data: {
            type: 'prayer_reminder',
            prayer: prayerName,
            url: '/',
          },
        });
      }, timeUntilPrayer);
    }
  }

  // Send subscription to server for later use
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // TODO: Implement endpoint to save subscription
      // await fetch('/api/notifications/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription),
      // });
      console.log('Push subscription ready (server integration pending)');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  // Convert VAPID key from URL-safe Base64 to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();

// Hook for React components
import { useEffect, useState } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!pushNotificationService.isSupported()) return;
    
    setPermission(pushNotificationService.getPermissionStatus());
  }, []);

  const subscribe = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      const subscription = await pushNotificationService.subscribe();
      setIsSubscribed(!!subscription);
    }
    return granted;
  };

  const unsubscribe = async () => {
    const success = await pushNotificationService.unsubscribe();
    if (success) {
      setIsSubscribed(false);
    }
    return success;
  };

  return {
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    isSupported: pushNotificationService.isSupported(),
    sendNotification: pushNotificationService.sendLocalNotification.bind(pushNotificationService),
  };
}
