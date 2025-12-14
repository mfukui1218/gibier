// app/admin/notifications/NotificationBell.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { app, db } from "@/lib/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function NotificationBell() {
  const user = useAuthUser();

  const isAdmin = useMemo(() => {
    const email = (user?.email ?? "").toLowerCase().trim();
    return email === ADMIN_EMAIL;
  }, [user]);

  const didInit = useRef(false);
  const [badge, setBadge] = useState(false); 

  useEffect(() => {
    // ✅ adminだけ / ログイン後だけ
    if (!isAdmin || !user) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (didInit.current) return;

    const run = async () => {
      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
      if (!vapidKey) {
        console.error("Missing env: NEXT_PUBLIC_FCM_VAPID_KEY");
        return;
      }

      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      // ✅ ここで一旦止める（失敗しても無限に走らせない）
      didInit.current = true;

      const swReg = await navigator.serviceWorker.ready;

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (!token) {
        console.error("No FCM token");
        return;
      }

      // ✅ トークン保存（管理者のみ許可の rules 前提）
      await setDoc(
        doc(db, "adminTokens", token),
        {
          token,
          owner: user.uid,
          ownerEmail: user.email ?? null,
          deviceName: "michihiro-iphone",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // ✅ フォアグラ受信（アプリ開いてる時用）
      onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);
        setBadge(true);

        if (Notification.permission !== "granted") return;
        const title = payload.notification?.title ?? "通知";
        const body = payload.notification?.body ?? "";
        new Notification(title, { body });
      });
    };

    run().catch((e) => console.error("notif init failed", e));
  }, [isAdmin, user]);

  if (user === undefined) return null;
  if (!isAdmin) return null;

  return (
    <button
      type="button"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        width: 42,
        height: 42,
        borderRadius: 9999,
        background: "rgba(0,0,0,0.45)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
      onClick={() => (location.href = "/admin/notifications")}
      aria-label="通知"
    >
      🔔{badge ? "•" : ""}
    </button>
  );
}
