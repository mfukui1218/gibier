// app/layout.tsx
import "./globals.css";
import "leaflet/dist/leaflet.css";
import RegisterServiceWorker from "./_components/RegisterServiceWorker"; // ★追加
import DebugClientError from "./_components/DebugClientError";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          color: "#fff",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <DebugClientError />
        {/* ★ Service Worker 登録（ここで1回だけ） */}
        <RegisterServiceWorker />


        {/* 背景画像 */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: "url('/backgrounds/main.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            zIndex: -2,
          }}
        />

        {/* 暗めのフィルター */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: -1,
          }}
        />

        {/* ページ本体 */}
        <div
          style={{
            position: "relative",
            zIndex: 0,
            padding: "32px 24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
