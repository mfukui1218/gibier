"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegister() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setMsg("このブラウザは Service Worker 非対応");
      return;
    }

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        setMsg(`Service Worker 登録OK: scope=${reg.scope}`);
      } catch (e) {
        console.error(e);
        setMsg("Service Worker 登録失敗");
      }
    })();
  }, []);

  // UIいらなければ return null にしてOK
  return (
    <div style={{ position: "fixed", bottom: 12, right: 12, fontSize: 12, opacity: 0.6 }}>
      {msg}
    </div>
  );
}
