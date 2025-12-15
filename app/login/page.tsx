// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import {handleGoogleLogin} from "./components/GoogleLoginButton"
import {handleAppleLogin} from "./components/AppleLoginButton"
import {loginWithEmailPassword}from "./lib/loginActions"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await loginWithEmailPassword({ email, password });
      router.push("/profile");
    } catch (e) {
      console.warn(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("ログインに失敗しました");
      }
    }
  }

  async function onGoogleClick() {
    setError("");
    try {
      await handleGoogleLogin();
      router.push("/profile");
    } catch (e) {
      console.warn(e);
      if (e instanceof Error) setError(e.message);
      else setError("Googleログインに失敗しました");
    }
  }

  async function onAppleClick() {
    setError("");
    try {
      await handleAppleLogin();
      router.push("/profile");
    } catch (e) {
      console.warn(e);
      if (e instanceof Error) setError(e.message);
      else setError("Appleログインに失敗しました");
    }
  }

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
            onClick={onGoogleClick}
            className="login-button"
          >
            Googleでログイン
          </button>

          <button
            type="button"
            onClick={onAppleClick}
            className="login-button"
          >
            Appleでログイン
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

