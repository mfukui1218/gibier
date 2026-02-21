"use client";
import { useEffect } from "react";

export default function DebugClientError() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      document.body.innerHTML =
        `<pre style="white-space:pre-wrap;padding:16px">
CLIENT ERROR:
${e.message}

${(e.error && (e.error as any).stack) ? (e.error as any).stack : ""}
</pre>`;
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return null;
}
