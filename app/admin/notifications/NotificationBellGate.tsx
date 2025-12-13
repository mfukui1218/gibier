"use client";

import { useEffect, useMemo } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import NotificationBell from "./NotificationBell";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function NotificationBellGate() {
  const user = useAuthUser();

  const isAdmin = useMemo(() => {
    const email = (user?.email ?? "").toLowerCase().trim();
    return email === ADMIN_EMAIL.toLowerCase();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!user) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
        if (!vapidKey) {
          console.error("Missing env: NEXT_PUBLIC_FCM_VAPID_KEY");
          return;
        }

        // 通知許可
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission:", permission);
          return;
        }

        // SW ready
        const swReg = await navigator.serviceWorker.ready;

        const messaging = getMessaging();

        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: swReg,
        });

        if (!token) {
          console.error("No FCM token");
          return;
        }

        // adminTokens/{token} に保存（管理者だけ許可のrules前提）
        await setDoc(
          doc(db, "adminTokens", token),
          {
            owner: user.uid,
            ownerEmail: user.email ?? null,
            deviceName: "michihiro-iphone", // いったん直書きOK
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        console.log("admin token registered:", token.slice(0, 20) + "...");
      } catch (e) {
        console.error("token register failed", e);
      }
    })();
  }, [isAdmin, user]);

  if (user === undefined) return null;
  if (!isAdmin) return null;

  return <NotificationBell />;
}
