// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>ジビエ管理サイト</h1>
      <p>まずアカウント作成またはログインしてください。</p>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href="/signup">
          <button>アカウント作成</button>
        </Link>

        <Link href="/login">
          <button>ログイン</button>
        </Link>
      </div>
    </main>
  );
}
