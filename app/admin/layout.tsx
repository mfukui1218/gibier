// app/admin/layout.tsx
import type { ReactNode } from "react";
import NotificationBell from "./notifications/NotificationBell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* ✅ 右上ベル（全ページ共通） */}
      <NotificationBell />

      {/* 管理画面の中身 */}
      {children}
    </div>
  );
}
