"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import "./login.css";

import GoogleLoginButton from "./components/GoogleLoginButton";
import AppleLoginButton from "./components/AppleLoginButton";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/invalid-email") setError("メールアドレスの形式が正しくありません。");
      else if (err.code === "auth/user-not-found") setError("このメールアドレスは登録されていません。");
      else if (err.code === "auth/wrong-password") setError("パスワードが違います。");
      else if (err.code === "auth/too-many-requests") setError("試行回数が多すぎます。しばらくしてから再試行してください。");
      else setError("ログインに失敗しました");
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

          <GoogleLoginButton
            className="login-button"
            onError={setError}
            onSuccess={() => router.push("/profile")}
          />

          <AppleLoginButton
            className="login-button"
            onError={setError}
            onSuccess={() => router.push("/profile")}
          />

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
