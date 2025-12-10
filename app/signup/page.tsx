// app/signup/page.tsx
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, app } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

// 共通ボタンスタイル（ログインと揃える）
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

// 入力欄スタイル（ログインと同じ）
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

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // 1) パスワード一致チェック
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }

      // 2) 管理者メールは allowedEmails チェックをスキップ
      let allowed = false;

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        allowed = true;
      } else {
        // 3) 一般ユーザーは Cloud Functions で許可メールチェック
        const functions = getFunctions(app);
        const checkAllowed = httpsCallable(functions, "checkAllowedEmail");

        const result = await checkAllowed({ email });
        const data = result.data as any;

        allowed = !!data.allowed;
      }

      if (!allowed) {
        setError("このメールアドレスでは登録できません。");
        return;
      }

      // 4) 許可されている場合だけ Firebase Auth にアカウント作成
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // 5) Firestore にユーザードキュメント作成
      await setDoc(doc(db, "users", user.uid), {
        email,
        createdAt: serverTimestamp(),
      });

      // 6) プロフィール登録へ
      router.push("/profile");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("このメールアドレスはすでに登録されています。ログインしてください。");
      } else if (err.code === "functions/not-found") {
        setError("システム設定エラー（checkAllowedEmail が見つかりません）");
      } else {
        setError("アカウント作成に失敗しました");
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
          アカウント作成
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
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
            登録
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
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
            ログイン画面へ戻る
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
