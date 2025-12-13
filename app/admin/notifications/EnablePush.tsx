"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db, messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? "";

export default function EnablePush() {
  const user = useAuthUser();
  const [status, setStatus] = useState("");

  useEffect(() => {
    // ログイン後にだけ
    if (!user || !messaging) return;
    if (!VAPID_KEY) {
      setStatus("VAPID_KEY がありません（NEXT_PUBLIC_FCM_VAPID_KEY）");
      return;
    }

    (async () => {
      try {
        // 通知許可
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setStatus("通知が許可されませんでした");
          return;
        }

        // FCM token
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) {
          setStatus("token が取得できませんでした");
          return;
        }

        // ✅ admin端末 token を保存（1ユーザー複数端末にしたいなら配列コレクションでもOK）
        await setDoc(
          doc(db, "adminPushTokens", user.uid),
          {
            uid: user.uid,
            email: user.email ?? null,
            token,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        setStatus("通知の準備OK（token保存済み）");
      } catch (e) {
        console.error(e);
        setStatus("失敗しました（console見て）");
      }
    })();
  }, [user]);

  return <div style={{ fontSize: 12, opacity: 0.8 }}>{status}</div>;
}
