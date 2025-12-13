// app/admin/notifications/NotificationBell.tsx
"use client";

export default function NotificationBell() {
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
      🔔
    </button>
  );
}
