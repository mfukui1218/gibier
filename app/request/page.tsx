"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import styles from "./request.module.css";

type Part = {
  id: string;
  name: string;
  animal?: string;
};

function RequestPageInner() {
  const user = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [parts, setParts] = useState<Part[]>([]);
  const [partId, setPartId] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ 未ログインなら /login に飛ばす（レンダー中に router.replace しない）
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // ✅ 部位一覧ロード（user が確定してから。未ログイン中は走らせない）
  useEffect(() => {
    if (!user) return; // undefined / null の間は何もしない

    const loadParts = async () => {
      const snap = await getDocs(collection(db, "parts"));
      const list: Part[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setParts(list);

      // URL に partId があれば初期選択
      const initial = searchParams.get("partId");
      if (initial) setPartId(initial);
    };

    loadParts();
  }, [user, searchParams]);

  const part = parts.find((p) => p.id === partId);

  // ✅ ここから下で return 分岐してOK（hooksはもう全部呼ばれてる）
  if (user === undefined) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  if (user === null) {
    return null; // useEffect が /login に飛ばす
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!partId) return setMessage("部位を選択してください");
    if (!amount) return setMessage("希望量（g）を入力してください");
    if (!address.trim()) return setMessage("送り先を入力してください");

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
      setPartId("");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error(err);
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
          <label className={styles.field}>
            <span className={styles.label}>希望する部位</span>
            <select
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              className={styles.select}
            >
              <option value="">選択してください</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.animal ? `${p.animal}：${p.name}` : p.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>希望量</span>
            <div className={styles.amountWrapper}>
              <input
                placeholder="希望量"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.amountInput}
              />
              <span className={styles.amountUnit}>g</span>
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>送り先</span>
            <textarea
              placeholder="送り先の住所を入力してください　　　　　　　LINEでも可（”LINE”と入力してください）"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </label>

          <button type="submit" disabled={sending} className={styles.button}>
            {sending ? "送信中..." : "リクエストを送信"}
          </button>
        </form>

        {message && (
          <p className={message.includes("失敗") ? styles.messageError : styles.messageOk}>
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
