"use client";

import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(() => {
    // 外部ブラウザに制御を渡す
    window.location.href = "/login";
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <p>ブラウザを切り替えています…</p>
      <p>自動で進まない場合は下のリンクを押してください。</p>
      <a href="/login">ログイン画面へ</a>
    </main>
  );
}
