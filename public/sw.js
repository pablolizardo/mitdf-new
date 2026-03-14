// PWA: installability + push notifications
const CACHE = 'mitdf-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('push', (e) => {
  let data = { title: 'miTDF', body: '', url: '/' };
  if (e.data) {
    try {
      data = { ...data, ...e.data.json() };
    } catch (_) {}
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/mitdf.webp',
      badge: '/mitdf.webp',
      tag: data.tag || 'mitdf-notification',
      data: { url: data.url || '/' },
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0 && clientList[0].visibilityState === 'visible') {
        clientList[0].navigate(url).catch(() => {});
        return clientList[0].focus();
      }
      if (clientList.length > 0) {
        return clientList[0].navigate(url).then((c) => c?.focus());
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(new URL(url, self.location.origin).href);
      }
    })
  );
});
