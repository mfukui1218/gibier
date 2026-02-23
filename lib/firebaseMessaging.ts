// lib/firebaseMessaging.ts
import { firebaseApp } from "./firebaseApp";

function canUseMessaging(): boolean {
  try {
    const ua = navigator.userAgent.toLowerCase();
    const isLine = ua.includes("line") || ua.includes("liff");
    return !isLine && "serviceWorker" in navigator;
  } catch {
    return false;
  }
}

export async function getFcmTokenSafely(): Promise<string | null> {
  // LINE内やSW非対応なら、そもそも messaging を読み込まない
  if (!canUseMessaging()) return null;

  try {
    // ★ここが重要：dynamic import
    const { isSupported, getMessaging, getToken } = await import("firebase/messaging");

    const ok = await isSupported();
    if (!ok) return null;

    const messaging = getMessaging(firebaseApp);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) return null;

    const token = await getToken(messaging, { vapidKey });
    return token || null;
  } catch {
    return null; // non-critical
  }
}
