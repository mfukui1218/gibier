// app/request/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MEAT_PARTS } from "@/lib/meatParts";
import styles from "./request.module.css";

function RequestPageInner() {
  const user = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL から partId を読む（なければ先頭の部位）
  const initialPartId = searchParams.get("partId") ?? MEAT_PARTS[0]?.id ?? "";

  const [partId, setPartId] = useState(initialPartId);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // 認証状態
  if (user === undefined) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  if (user === null) {
    router.replace("/login");
    return null;
  }

  const part = MEAT_PARTS.find((p) => p.id === partId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!partId) {
      setMessage("部位を選択してください");
      return;
    }
    if (!amount) {
      setMessage("希望量（g）を入力してください");
      return;
    }
    if (!address.trim()) {
      setMessage("送り先を入力してください");
      return;
    }

    const ok = window.confirm(
      `${part?.name ?? partId} を ${amount}g、以下の住所に希望として送信します。\n\n${address}\n\nよろしいですか？`
    );
    if (!ok) return;

    setSending(true);

    try {
      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: user.email ?? null,
        partId,
        amount,
        address,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setMessage("リクエストを送信しました！");
      setAmount("");
      setAddress("");

      window.setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      console.error(e);
      setMessage("送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>ジビエ希望リクエスト</h1>
        <p className={styles.subtitle}>ログイン中：{user.email}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 部位選択 */}
          <label className={styles.field}>
            <span className={styles.label}>希望する部位</span>
            <select
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              className={styles.select}
            >
              {MEAT_PARTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.animal ? `${p.animal}：${p.name}` : p.name}
                </option>
              ))}
            </select>
          </label>

          {/* 希望量 */}
          <label className={styles.field}>
            <span className={styles.label}>希望量</span>
            <div className={styles.amountWrapper}>
              <input
                type="number"
                placeholder="希望量"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.amountInput}
              />
              <span className={styles.amountUnit}>g</span>
            </div>
          </label>

          {/* 送り先 */}
          <label className={styles.field}>
            <span className={styles.label}>送り先</span>
            <textarea
              placeholder={`郵便番号・都道府県・市区町村・番地など送ってほしい場所。
LINEで住所教えてくれても可（"LINE" と送ればOK）`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className={styles.button}
          >
            {sending ? "送信中..." : "リクエストを送信"}
          </button>
        </form>

        {message && (
          <p
            className={
              message.includes("失敗")
                ? styles.messageError
                : styles.messageOk
            }
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.loading}>読み込み中...</div>
        </main>
      }
    >
      <RequestPageInner />
    </Suspense>
  );
}
