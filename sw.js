// sw.js — minimal service worker so mobile browsers can show notifications.
// Mobile Chrome/Android and iOS Safari (PWA) require notifications to be
// shown via a service worker registration, not the `new Notification()` ctor.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// The page asks the SW to display a notification via postMessage.
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type !== 'show-notification') return;
  event.waitUntil(
    self.registration.showNotification(d.title || 'chat', {
      body: d.body || '',
      tag: d.tag || 'chatweb-msg',
      renotify: true,
      silent: false,
      data: { url: d.url || '/' }
    })
  );
});

// Tapping the notification focuses an existing tab or opens a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
