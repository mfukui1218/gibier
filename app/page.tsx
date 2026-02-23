// app/page.tsx
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";

// 共通ボタンスタイル（login / signup と揃える）
const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  transition: "all 0.25s",
};

// ボタンをリンク化する小コンポーネント
function ButtonLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href}>
      <button
        style={buttonStyle}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.25)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {props.children}
      </button>
    </Link>
  );
}

export default function HomePage() {
  const user = useAuthUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 8,
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          ジビエ管理サイト
        </h1>

        <p style={{ fontSize: 13, color: "#ddd", marginBottom: 20 }}>
          捕獲したジビエの在庫管理・希望リクエスト・配送先管理をまとめて行うための
          管理ツールです。
        </p>

        {/* 許可制っぽい挙動：ログイン状態で表示を分ける */}
        {user === undefined && (
          <p style={{ fontSize: 13 }}>ログイン状態を確認しています…</p>
        )}

        {user === null && (
          <>
            <p
              style={{
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              利用は
              <span style={{ fontWeight: 600 }}>招待制（許可されたメールアドレスのみ）</span>
              です。
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <ButtonLink href="/signup">アカウント作成</ButtonLink>
              <ButtonLink href="/login">ログイン</ButtonLink>
            </div>
          </>
        )}

        {user && (
          <>
            <p
              style={{
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.7,
              }}
            >
              ログイン中：<span style={{ fontWeight: 600 }}>{user.email}</span>
              <br />
              許可済みアカウントとして管理画面を利用できます。
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <ButtonLink href="/profile">プロフィール</ButtonLink>
              <ButtonLink href="/home">Home</ButtonLink>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
