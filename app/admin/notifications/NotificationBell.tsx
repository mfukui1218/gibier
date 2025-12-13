"use client";

import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/admin/notifications")}
      style={{
        position: "fixed",
        top: 16,
        right: 30,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.35)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      🔔
    </button>
  );
}
