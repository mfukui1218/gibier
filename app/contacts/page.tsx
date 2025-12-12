"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";
import styles from "./contact.module.css";

export default function ContactPage() {
  const user = useAuthUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

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
        name: name || null,
        email: email || null,
        message,
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

          <button
            type="submit"
            className={styles.button}
            disabled={sending}
          >
            {sending ? "送信中…" : "送信"}
          </button>
        </form>

        {status && (
          <p
            className={
              status.includes("失敗")
                ? styles.statusError
                : styles.statusSuccess
            }
          >
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
