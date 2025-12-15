"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

import { signupWithEmailPassword } from "./lib/signupActions";
import { requestApproval } from "./lib/approvalActions";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setRequestStatus("");

    try {
      await signupWithEmailPassword({ email, password, confirmPassword });
      router.push("/profile");
    } catch (e: any) {
      setError(e?.message ?? "アカウント作成に失敗しました");
    }
  }

  async function handleRequestApproval() {
    setError("");
    setRequestStatus("");

    try {
      await requestApproval(requestEmail);
      setRequestEmail("");
      setRequestStatus("許可申請を送信しました。承認されると登録できるようになります。");
    } catch (e: any) {
      console.error(e);
      setRequestStatus(e?.message ?? "許可申請の送信に失敗しました。");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>アカウント作成</h1>

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

        <div className={styles.requestSection}>
          <h3 className={styles.requestTitle}>許可申請（登録できない場合）</h3>

          <input
            type="email"
            placeholder="申請するメールアドレス"
            value={requestEmail}
            onChange={(e) => setRequestEmail(e.target.value)}
            className={styles.input}
          />

          <button type="button" onClick={handleRequestApproval} className={styles.button}>
            許可申請を送信する
          </button>

          {requestStatus && <p className={styles.requestStatus}>{requestStatus}</p>}
        </div>
      </div>
    </main>
  );
}
