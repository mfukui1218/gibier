// app/admin/contacts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function formatDate(ts: any) {
  if (!ts) return "-";
  const d = ts.toDate();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${
    d.getHours()
  }:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminContactsPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  // 未ログイン → /login
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // Firestore購読（管理者のみ）
  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) return;

    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      (err) => {
        console.error(err);
        setError("読み込み中にエラーが発生しました");
      }
    );

    return () => unsub();
  }, [user]);

  // 削除
  async function deleteContact(id: string) {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteDoc(doc(db, "contacts", id));
    } catch (e) {
      console.error(e);
      setError("削除に失敗しました");
    }
  }

  // ロード中
  if (user === undefined) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // 非管理者
  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <main style={{ padding: 24 }}>
        <h2>アクセス拒否</h2>
        <p>管理者のみ閲覧可能です。</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>問い合わせ一覧</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <p>問い合わせはまだありません。</p>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 12,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fff",

				color : "#000000",
              }}
            >
              <p>
                <strong>名前：</strong>
                {item.name || "（未入力）"}
              </p>
              <p>
                <strong>メール：</strong>
                {item.email || "（未入力）"}
              </p>
              <p>
                <strong>内容：</strong>
                <br />
                {item.message}
              </p>
              <p>
                <strong>日時：</strong>
                {formatDate(item.createdAt)}
              </p>

              <button
                onClick={() => deleteContact(item.id)}
                style={{
                  marginTop: 12,
                  padding: "6px 12px",
                  background: "#dc2626",
                  color: "#fff",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
