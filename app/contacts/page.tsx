"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";
import styles from "./contact.module.css";

export default function ContactPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // ← 初期値は空にする
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ ログインが確定したら email を同期
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  // ✅ 未ログインならログインへ
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (user === undefined) {
    return <main className={styles.container}>読み込み中...</main>;
  }
  if (user === null) {
    return null; // useEffectで/loginへ飛ぶ
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (!message.trim()) {
      setStatus("内容を入力してください");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "contacts"), {
        userId: user.uid,                 // ✅ 誰が送ったか
        userEmail: user.email ?? null,    // ✅ Authのemail
        name: name.trim() || null,
        email: email.trim() || null,      // 返信先として任意
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "adminNotifications"), {
        type: "contact",
        title: "お問い合わせ",
        body: `${email || "未入力"}: ${message.slice(0, 80)}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      setStatus("送信しました！");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>お問い合わせ</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            お名前（任意）
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前を入力"
            />
          </label>

          <label className={styles.label}>
            メールアドレス（任意）
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="返信先メール"
            />
          </label>

          <label className={styles.label}>
            内容
            <textarea
              className={styles.textarea}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="お問い合わせ内容を入力"
            />
          </label>

          <button type="submit" className={styles.button} disabled={sending}>
            {sending ? "送信中…" : "送信"}
          </button>
        </form>

        {status && (
          <p className={status.includes("失敗") ? styles.statusError : styles.statusSuccess}>
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
