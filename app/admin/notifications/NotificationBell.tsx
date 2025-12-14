// app/admin/notifications/NotificationBell.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "")
  .toLowerCase()
  .trim();

export default function NotificationBell() {
  const user = useAuthUser();

  const isAdmin = useMemo(() => {
    const email = (user?.email ?? "").toLowerCase().trim();
    return email !== "" && email === ADMIN_EMAIL;
  }, [user]);

  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) return;

    const loadCount = async () => {
      try {
        // 「未対応」を厳密にやるなら status 条件が必要。今は総件数でOK。
        const [req, con, allow] = await Promise.all([
          getCountFromServer(collection(db, "requests")),
          getCountFromServer(collection(db, "contacts")),
          getCountFromServer(collection(db, "allowRequests")),
        ]);
        setCount(req.data().count + con.data().count + allow.data().count);
      } catch (e) {
        console.error("[Bell] count error:", e);
        setCount(0);
      }
    };

    loadCount();

    // 適当に更新（必要なら外してもOK）
    const t = window.setInterval(loadCount, 30_000);
    return () => window.clearInterval(t);
  }, [isAdmin]);

  if (user === undefined) return null;
  if (!isAdmin) return null;

  const hasBadge = count > 0;

  return (
    <button
      type="button"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 9999,
        background: "rgba(0,0,0,0.45)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
        display: "grid",
        placeItems: "center",
      }}
      onClick={() => (location.href = "/admin/notifications")}
      aria-label="統合管理"
      title="統合管理"
    >
      <span style={{ position: "relative", lineHeight: 1 }}>
        🔔
        {hasBadge ? (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -10,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9999,
              background: "#ff3b30",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
    </button>
  );
}
