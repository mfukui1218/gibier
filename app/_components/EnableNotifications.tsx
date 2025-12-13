"use client";

import { useEffect } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase"; // initializeApp してるやつ
import { useAuthUser } from "@/hooks/useAuthUser";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default function EnableNotifications() {
  const user = useAuthUser();
  useEffect(() => {
	if (!user) return;
    if (user.email !== ADMIN_EMAIL) return;
    const run = async () => {
      // 通知許可
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return;
      }

      // Messaging インスタンス
      const messaging = getMessaging(app);

      // FCM トークン取得
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      if (token) {
        console.log("FCM token:", token);
        // TODO: Firestore 等に保存
      } else {
        console.log("No registration token available");
      }
    };

    if ("serviceWorker" in navigator) {
      run().catch(console.error);
    }
  }, []);

  return null;
}
