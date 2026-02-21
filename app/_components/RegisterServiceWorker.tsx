"use client";

import { useEffect, useState } from "react";

export default function RegisterServiceWorker() {
  const [isLineApp, setIsLineApp] = useState(false);

  useEffect(() => {
    // LINEアプリ内ブラウザを検出
    const userAgent = navigator.userAgent.toLowerCase();
    const isLine = userAgent.includes('line/');
    setIsLineApp(isLine);

    // Service Workerをサポートしていない、またはLINEアプリの場合はスキップ
    if (!("serviceWorker" in navigator) || isLine) {
      console.log("Service Worker not supported or in LINE app");
      return;
    }

    // エラーが発生してもアプリが動作するように try-catch で囲む
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((err) => {
        console.warn("SW registration failed (non-critical):", err);
        // エラーを握りつぶす - アプリは続行できる
      });
  }, []);

  // LINEアプリの場合は外部ブラウザで開くように促す
  if (isLineApp) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px',
        backgroundColor: '#06c755',
        color: 'white',
        textAlign: 'center',
        fontSize: '14px',
        zIndex: 9999
      }}>
        右上の「...」から「Safari/Chromeで開く」を選択してください
      </div>
    );
  }

  return null;
}
