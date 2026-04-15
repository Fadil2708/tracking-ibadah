// Enhanced Service Worker with Push Notification Support
// This file handles background notifications and push events

const CACHE_NAME = 'ibadah-tracker-v2';
const OFFLINE_URL = '/offline';

// Install event - cache offline resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Ibadah Tracker',
    body: 'Waktunya mencatat ibadah',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'ibadah-notification',
    requireInteraction: true,
    data: { url: '/' },
    actions: [
      { action: 'view', title: 'Buka Dashboard' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'close') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = notificationData?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already a window open
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  // Track notification dismissal if needed
  console.log('Notification closed:', event.notification.tag);
});

// Periodic background sync (when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ibadah') {
    event.waitUntil(syncIbadahData());
  }
});

// Background sync for ibadah data
async function syncIbadahData() {
  try {
    // Get pending sync requests from IndexedDB
    // This is a placeholder - implement based on your offline storage
    console.log('Background sync triggered');
    
    // When implementing offline queue:
    // 1. Get pending records from IndexedDB
    // 2. Send to server
    // 3. Remove synced records
    // 4. Show success notification
    
    self.registration.showNotification('Sync Berhasil', {
      body: 'Data ibadah berhasil disinkronkan',
      icon: '/icons/icon-192x192.png',
      tag: 'sync-success',
    });
  } catch (error) {
    console.error('Sync failed:', error);
    
    self.registration.showNotification('Sync Gagal', {
      body: 'Gagal menyinkronkan data. Coba lagi nanti.',
      icon: '/icons/icon-192x192.png',
      tag: 'sync-failed',
    });
  }
}

// Periodic background fetch for prayer times updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-prayer-times') {
    event.waitUntil(updatePrayerTimes());
  }
});

async function updatePrayerTimes() {
  try {
    // Fetch updated prayer times based on user location
    // This runs periodically in the background
    console.log('Updating prayer times...');
  } catch (error) {
    console.error('Failed to update prayer times:', error);
  }
}
