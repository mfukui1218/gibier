// app/admin/notifications/NotificationBellGate.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { messaging, db } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import NotificationBell from "./NotificationBell";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function NotificationBellGate() {
  const user = useAuthUser();

  const isAdmin = useMemo(() => {
    const email = (user?.email ?? "").toLowerCase().trim();
    return email === ADMIN_EMAIL;
  }, [user]);

  useEffect(() => {
    if (!isAdmin || !user || !messaging) return;

    (async () => {
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (!token) return;

        // ✅ ここが質問のコード
        await setDoc(
          doc(db, "adminTokens", token),
          {
            owner: user.uid,
            deviceName: "michihiro-iphone", // 今は直書きでOK
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        console.log("admin token registered");
      } catch (e) {
        console.error("token register failed", e);
      }
    })();
  }, [isAdmin, user]);

  if (user === undefined) return null;
  if (!isAdmin) return null;

  return <NotificationBell />;
}
