"use client";

import { useEffect, useMemo } from "react";

function isLineInApp(): boolean {
  try {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("line") || ua.includes("liff");
  } catch {
    // 例外が出る環境は全部スキップ
    return true;
  }
}

export default function RegisterServiceWorker() {
  const skip = useMemo(() => isLineInApp(), []);

  useEffect(() => {
    if (skip) return;

    try {
      if (!("serviceWorker" in navigator)) return;

      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch(() => {
          /* non-critical */
        });
    } catch {
      /* non-critical */
    }
  }, [skip]);

  return null;
}
