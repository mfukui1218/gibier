// app/admin/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function AdminTopPage() {
  const user = useAuthUser();
  const router = useRouter();

  // 認証状態読み込み中
  if (user === undefined) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // 未ログインなら /login へ
  if (user === null) {
    router.replace("/login");
    return null;
  }

  // 管理者チェック
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main style={{ padding: 24 }}>
        <h1>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>管理メニュー</h1>
      <p>ログイン中：{user.email}</p>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => router.push("/admin/stock")}>
          在庫管理（parts）
        </button>

        <button onClick={() => router.push("/admin/allowed")}>
          許可メールアドレス追加
        </button>

        <button onClick={() => router.push("/admin/requests")}>
          リクエスト一覧（希望g・住所など）
        </button>
      </div>
    </main>
  );
}
