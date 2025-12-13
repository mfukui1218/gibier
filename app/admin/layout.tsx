import type { ReactNode } from "react";
import ClientProviders from "./ClientProviders";

export const metadata = { manifest: "/manifest.json" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <ClientProviders />
      {children}
    </div>
  );
}
