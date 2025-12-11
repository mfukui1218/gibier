// app/admin/requests/page.tsx
"use client";

import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { MEAT_PARTS } from "@/lib/meatParts";
import { useAuthUser } from "@/hooks/useAuthUser";
import styles from "./requests.module.css";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

function formatDate(ts: any) {
  if (!ts || typeof ts.toDate !== "function") return "日時なし";
  const date = ts.toDate();
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

type RequestItem = {
  id: string;
  partId: string;
  amount?: string;
  address?: string;
  createdAt?: any;
  status?: string;
  userId?: string;
  userEmail?: string | null;
  profile?: {
    name?: string;
    relationship?: string;
  } | null;
};

export default function RequestsPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [items, setItems] = useState<RequestItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 未ログインなら /login へ
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // Firestore購読（admin だけ）
  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) return;

    const q = query(
      collection(db, "requests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const rows: RequestItem[] = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data() as any;
              let profile: any = null;

              if (data.userId) {
                const userRef = doc(db, "users", data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  profile = userSnap.data();
                }
              }

              return {
                id: d.id,
                ...data,
                profile,
              };
            })
          );

          setItems(rows);
          setLoading(false);
        } catch (e) {
          console.error(e);
          setError("データの読み込み中にエラーが発生しました");
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError("権限エラーまたは接続エラーが発生しました");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  async function handleComplete(id: string) {
    try {
      await updateDoc(doc(db, "requests", id), { status: "done" });
    } catch (e) {
      console.error(e);
      setError("状態更新に失敗しました");
    }
  }

  async function remove(id: string) {
  const ok = window.confirm("このリクエストを削除します。よろしいですか？");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "requests", id));
  } catch (e) {
    console.error(e);
    setError("削除に失敗しました");
  }
}


  // 読み込み中
  if (user === undefined) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  // 未ログイン（上でリダイレクトしているので何も描画しない）
  if (user === null) {
    return null;
  }

  // 管理者以外
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>アクセス拒否</h1>
          <p>このページは管理者のみ利用できます。</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>欲しいリクエスト一覧</h1>
            <p className={styles.subtitle}>ログイン中：{user.email}</p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.countBadge}>
              {items.length} 件
            </span>
          </div>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p className={styles.loadingText}>読み込み中...</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>まだリクエストはありません。</p>
        ) : (
          <ul className={styles.list}>
            {items.map((req) => {
              const part = MEAT_PARTS.find((p) => p.id === req.partId);
              const profile = req.profile;

              const partLabel = part
                ? `${part.animal ? part.animal + "：" : ""}${part.name}`
                : req.partId ?? "不明な部位";

              const status = req.status ?? "未設定";
              const isDone = status === "done";

              return (
                <li
                  key={req.id}
                  className={`${styles.card} ${
                    isDone ? styles.cardDone : ""
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.partBlock}>
                      <span className={styles.partLabel}>{partLabel}</span>
                      <span className={styles.amount}>
                        {req.amount ?? "未入力"} g
                      </span>
                    </div>
                    <div className={styles.statusBlock}>
                      <span
                        className={
                          isDone ? styles.statusDone : styles.statusPending
                        }
                      >
                        {isDone ? "対応済み" : "未対応"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <span className={styles.label}>ユーザー名</span>
                    <span className={styles.value}>
                      {profile?.name ?? "名前未登録"}
                    </span>
                  </div>

                  <div className={styles.row}>
                    <span className={styles.label}>メール</span>
                    <span className={styles.value}>
                      {req.userEmail ?? "メール未登録"}
                    </span>
                  </div>

                  {profile?.relationship && (
                    <div className={styles.row}>
                      <span className={styles.label}>関係</span>
                      <span className={styles.value}>
                        {profile.relationship}
                      </span>
                    </div>
                  )}

                  <div className={styles.row}>
                    <span className={styles.label}>送り先</span>
                    <span className={styles.valueMulti}>
                      {req.address ?? "住所未入力"}
                    </span>
                  </div>

                  <div className={styles.footerRow}>
                    <span className={styles.date}>
                      送信日時：{formatDate(req.createdAt)}
                    </span>

                    {!isDone && (
                      <button
                        type="button"
                        className={styles.doneButton}
                        onClick={() => handleComplete(req.id)}
                      >
                        対応済みにする
                      </button>
                    )}
                  </div>
                                        <button
                        onClick={() => remove(req.id)}
                        style={{
                          marginLeft: 8,
                          background: "#ff4d4d",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        削除
                      </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
