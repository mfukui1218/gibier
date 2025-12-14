// app/admin/layout.tsx
import type { ReactNode } from "react";
import NotificationBell from "./notifications/NotificationBell";

export const metadata = { manifest: "/manifest.json" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <NotificationBell />
      {children}
    </div>
  );
}
