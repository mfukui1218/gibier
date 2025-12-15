// app/login/page.tsx
"use client";

import { useState } from "react";

import { auth, app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import "./login.css"; // ★ 追加
import {handleGoogleLogin} from "./components/GoogleLoginButton"
import {handleAppleLogin} from "./components/AppleLoginButton"
import {handleSubmit}from "./components/LoginButton"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="login-root">
      <div className="login-card">
        <h1 className="login-title">ログイン</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button type="submit" className="login-button">
            ログイン
          </button>

          <button
            type="button"
            onClick={async () => {
              setError("");
              try {
                await handleGoogleLogin();
                router.push("/profile");
              } catch (e: any) {
                setError(e?.message ?? "Googleログインに失敗しました");
              }
            }}
            className="login-button"
          >
            Googleでログイン
          </button>

          <button
            type="button"
            onClick={async () => {
              setError("");
              try {
                await handleAppleLogin();
                router.push("/profile");
              } catch (e: any) {
                setError(e?.message ?? "Appleログインに失敗しました");
              }
            }}
            className="login-button"
          >
            Aooleでログイン
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="login-button"
          >
            アカウント作成
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
      </div>
    </main>
  );
}

