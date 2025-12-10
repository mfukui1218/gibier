// app/login/page.tsx
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// 共通ボタンスタイル（signup と揃える）
const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  width: "100%",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  transition: "all 0.25s",
  marginTop: 14,
};

// 入力欄スタイル（signup と揃える）
const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#ffffff",
  color: "#000000",
  fontSize: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Email + Password ログイン
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません。");
      } else if (err.code === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (err.code === "auth/wrong-password") {
        setError("パスワードが違います。");
      } else if (err.code === "auth/too-many-requests") {
        setError("試行回数が多すぎます。しばらくしてから再試行してください。");
      } else {
        setError("ログインに失敗しました");
      }
    }
  }

  // Googleログイン
  async function handleGoogleLogin() {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/popup-closed-by-user") {
        return;
      }

      if (err.code === "auth/account-exists-with-different-credential") {
        setError("別のログイン方法で既に登録されています。メールアドレスでログインを試してください。");
      } else {
        setError("Googleログインに失敗しました");
      }
    }
  }

  // Appleログイン
  async function handleAppleLogin() {
    setError("");
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");

      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/popup-closed-by-user") {
        return;
      }

      if (err.code === "auth/account-exists-with-different-credential") {
        setError("別のログイン方法で既に登録されています。メールアドレスでログインを試してください。");
      } else {
        setError("Appleログインに失敗しました");
      }
    }
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
          maxWidth: 360,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          ログイン
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
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
            ログイン
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
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
            Googleでログイン
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
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
            Appleでログイン
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
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
            アカウント作成
          </button>
        </form>

        {error && (
          <p style={{ marginTop: 12, color: "#ff8080" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
