// Firebase Cloud Messaging Service Worker
// Required for background push notifications
// This file MUST be at the root of the public directory (/public/firebase-messaging-sw.js)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// NOTE: These are the public-safe Firebase config values (NOT secret keys).
// These are the same values visible to any user of the app — this is normal for Firebase.
// Your ACTUAL sensitive data is protected by Firebase Security Rules.
const firebaseConfig = {
  apiKey: self.__FIREBASE_API_KEY__ || '',
  authDomain: self.__FIREBASE_AUTH_DOMAIN__ || '',
  projectId: self.__FIREBASE_PROJECT_ID__ || '',
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__ || '',
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || '',
  appId: self.__FIREBASE_APP_ID__ || '',
};

// Only initialize if config is available
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background push notifications
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);
    const title = payload.notification?.title || 'VillageHealth Alert';
    const body = payload.notification?.body || 'New blood request alert';
    const icon = '/icon-192.png';

    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icon-192.png',
      tag: 'blood-alert',
      data: payload.data,
      actions: [
        { action: 'view', title: 'View Request' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  });

  // Handle notification click
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'view') {
      event.waitUntil(clients.openWindow('/'));
    }
  });
}
