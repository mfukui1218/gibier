// app/dashboard/page.tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  width: "100%",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.25s",
  textAlign: "center",
};

export default function DashboardPage() {
  const user = useAuthUser();
  const router = useRouter();

  // 未ログインなら /login に飛ばす
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <main style={{ padding: 24, textAlign: "center", color: "#fff" }}>
        読み込み中...
      </main>
    );
  }

  if (user === null) {
    return null;
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <main
      style={{
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          ダッシュボード
        </h1>

        <p
          style={{
            fontSize: 13,
            textAlign: "center",
            marginBottom: 16,
            color: "#eee",
          }}
        >
          ログイン中：{user.email}
        </p>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.25)",
            margin: "12px 0 20px",
          }}
        />

        <h2
          style={{
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          メニュー
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/home")}
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
            ジビエ部位一覧へ
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
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
            プロフィール編集
          </button>

          <button
            type="button"
            onClick={() => router.push("/request")}
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
            ジビエ希望リクエストを書く
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              marginTop: 18,
              borderColor: "rgba(255,150,150,0.7)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,120,120,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
