"use client";

import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, messaging } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function SaveAdminFcmToken() {
  const user = useAuthUser();

  useEffect(() => {
    if (!messaging) return;
    if (user === undefined || user === null) return;

    const email = (user.email ?? "").toLowerCase().trim();
    if (email !== ADMIN_EMAIL.toLowerCase()) return;

    (async () => {
      // permission-blocked の時はここで落ちる（もう解決済みっぽい）
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) return;

      await setDoc(
        doc(db, "adminTokens", token),
        {
          token,
          email,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log("saved admin token:", token);
    })().catch(console.error);
  }, [user]);

  return null;
}
