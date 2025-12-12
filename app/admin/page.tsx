// app/admin/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { CSSProperties } from "react";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

// 共通カードスタイル
const cardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(8px)",
};

// ページ全体
const mainStyle: CSSProperties = {
  padding: 24,
  display: "flex",
  justifyContent: "center",
};

const innerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "rgba(0,0,0,0.35)",
  borderRadius: 16,
  padding: 24,
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  color: "#fff",
};

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
    <main style={mainStyle}>
      <div style={innerStyle}>
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            管理メニュー
          </h1>
          <p style={{ fontSize: 13, color: "#ddd" }}>
            ログイン中：{user.email}
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {/* 在庫管理 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/stock")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>在庫管理</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              各部位の価格と在庫量を編集
            </p>
          </div>

          {/* 許可メール */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/allowed")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>許可メール管理</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              登録を許可するメールアドレスの確認・追加
            </p>
          </div>

          {/* リクエスト一覧 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/requestlist")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>リクエスト一覧</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              希望 g・住所付きの「欲しいリクエスト」を確認
            </p>
          </div>

          {/* 問い合わせ一覧 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/contacts")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>問い合わせ一覧</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              /contact から送られた問い合わせ内容を確認
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
