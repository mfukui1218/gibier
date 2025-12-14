"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, app } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { isEmailAllowed } from "@/lib/authRules";
import styles from "./signup.module.css";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function SignUpPage() {
  const router = useRouter();

  // 登録用
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 許可申請用
  const [requestEmail, setRequestEmail] = useState("");

  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  // アカウント作成
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setRequestStatus("");

    try {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }

      const normalized = email.trim().toLowerCase();
      let allowed = false;

      if (normalized === ADMIN_EMAIL.toLowerCase()) {
        allowed = true;
      } else {
        allowed = await isEmailAllowed(normalized);
      }

      if (!allowed) {
        setError(
          "このメールアドレスでは現在登録できません。下の許可申請フォームから申請できます。"
        );
        return;
      }

      const cred = await createUserWithEmailAndPassword(
        auth,
        normalized,
        password
      );
      const user = cred.user;

      await setDoc(doc(db, "users", user.uid), {
        email: normalized,
        createdAt: serverTimestamp(),
      });

      router.push("/profile");
    } catch (err: any) {
      console.error(err);
      setError("アカウント作成に失敗しました");
    }
  }

  // 許可申請の送信
  async function handleRequestApproval() {
    setRequestStatus("");
    setError("");

    if (!requestEmail) {
      setError("許可申請するメールアドレスを入力してください。");
      return;
    }

    try {
      const functions = getFunctions(app, "us-central1");
      const requestAllowEmail = httpsCallable(functions, "requestAllowEmail");
      await requestAllowEmail({ email: requestEmail });
      setRequestEmail("");

      setRequestStatus(
        "許可申請を送信しました。承認されると登録できるようになります。"
      );
    } catch (err) {
      console.error(err);
      setRequestStatus("許可申請の送信に失敗しました。");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>アカウント作成</h1>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            登録
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className={styles.button}
          >
            ログイン画面へ戻る
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {/* 許可申請フォーム */}
        <div className={styles.requestSection}>
          <h3 className={styles.requestTitle}>許可申請（登録できない場合）</h3>

          <input
            type="email"
            placeholder="申請するメールアドレス"
            value={requestEmail}
            onChange={(e) => setRequestEmail(e.target.value)}
            className={styles.input}
          />

          <button
            type="button"
            onClick={handleRequestApproval}
            className={styles.button}
          >
            許可申請を送信する
          </button>

          {requestStatus && (
            <p className={styles.requestStatus}>{requestStatus}</p>
          )}
        </div>
      </div>
    </main>
  );
}
