// app/admin/requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { MEAT_PARTS } from "@/lib/meatParts";
import { useAuthUser } from "@/hooks/useAuthUser";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

function formatDate(ts: any) {
  if (!ts) return "日時なし";
  const date = ts.toDate();
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

export default function RequestsPage() {
  const user = useAuthUser();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  // 未ログインなら /login へ
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // Firestore購読（admin だけ）
  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) return; // 管理者以外は購読しない

    // createdAt の新しい順
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const rows = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data();
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
        } catch (e) {
          console.error(e);
          setError("データの読み込み中にエラーが発生しました");
        }
      },
      (err) => {
        console.error(err);
        setError("権限エラーまたは接続エラーが発生しました");
      }
    );

    return () => unsub();
  }, [user]);

  async function complete(id: string) {
    try {
      await updateDoc(doc(db, "requests", id), { status: "done" });
    } catch (e) {
      console.error(e);
      setError("状態更新に失敗しました");
    }
  }

  // 読み込み中
  if (user === undefined) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // 未ログイン（上でリダイレクトしているので何も描画しない）
  if (user === null) {
    return null;
  }

  // 管理者以外
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main style={{ padding: 24 }}>
        <h1>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>欲しいリクエスト一覧</h1>
      {error && (
        <p style={{ color: "red", marginBottom: 12 }}>
          {error}
        </p>
      )}

      {items.map((req) => {
        const part = MEAT_PARTS.find((p) => p.id === req.partId);
        const profile = req.profile;

        return (
          <div
            key={req.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 12,
            }}
          >
            <p>{part?.animal}</p>
            <p>部位：{part?.name}</p>
            <p>希望量：{req.amount ?? "未入力"} g</p>
            
            <p>ユーザー：{profile?.name ?? "名前未登録"}</p>
            <p>送信日時：{formatDate(req.createdAt)}</p>
            <p>送り先：{req.address ?? "住所未入力"}</p>
            {profile?.relationship && <p>関係：{profile.relationship}</p>}

            <p>状態：{req.status ?? "未設定"}</p>

            {req.status === "pending" && (
              <button onClick={() => complete(req.id)}>対応済みにする</button>
            )}
          </div>
        );
      })}
    </main>
  );
}
