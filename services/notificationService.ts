import { getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { ref, set, remove } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebaseConfig';

const env = (import.meta as any).env || {};
const VAPID_KEY = env.VITE_FIREBASE_VAPID_KEY || '';

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (!isFirebaseConfigured) return null;
  if (messaging) return messaging;
  try {
    const app = getApp();
    messaging = getMessaging(app);
    return messaging;
  } catch (e) {
    console.warn('[FCM] Could not get messaging instance:', e);
    return null;
  }
}

/**
 * Request browser notification permission.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported in this browser.');
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Get FCM token for this device. Requires VITE_FIREBASE_VAPID_KEY in .env.local
 * and the firebase-messaging-sw.js service worker in /public.
 */
export async function getFCMToken(): Promise<string | null> {
  const msg = getMessagingInstance();
  if (!msg) return null;
  if (!VAPID_KEY) {
    console.warn('[FCM] VITE_FIREBASE_VAPID_KEY not set. Push notifications disabled.');
    return null;
  }
  try {
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (e) {
    console.warn('[FCM] getToken failed (user may have blocked notifications or SW not registered):', e);
    return null;
  }
}

/**
 * Save an FCM token to Firebase so Cloud Functions can notify this device.
 * district and bloodType allow targeted notifications.
 */
export async function saveFCMToken(
  token: string,
  district: string,
  bloodType: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await set(ref(db, `fcmTokens/${token.slice(-20)}`), {
      token,
      district,
      bloodType,
      registeredAt: Date.now(),
    });
  } catch (e) {
    console.warn('[FCM] Could not save token:', e);
  }
}

/**
 * Remove an FCM token (opt out of notifications).
 */
export async function removeFCMToken(token: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await remove(ref(db, `fcmTokens/${token.slice(-20)}`));
  } catch (e) {
    console.warn('[FCM] Could not remove token:', e);
  }
}

/**
 * Listen for foreground push messages (when app is open).
 * Returns unsubscribe function.
 */
export function onForegroundMessage(
  callback: (payload: { title: string; body: string; data?: any }) => void
): () => void {
  const msg = getMessagingInstance();
  if (!msg) return () => {};
  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title || 'VillageHealth Alert',
      body: payload.notification?.body || '',
      data: payload.data,
    });
  });
}
