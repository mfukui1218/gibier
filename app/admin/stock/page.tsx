// app/admin/stock/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { MEAT_PARTS, MeatPart } from "@/lib/meatParts";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

type PartState = {
  price: string;
  stock: string;
};

export default function AdminStockPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [partsState, setPartsState] = useState<Record<string, PartState>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 未ログインなら login へ
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // 初期ロード（Firestore から price / stock を読む）
  useEffect(() => {
    const load = async () => {
      try {
        const nextState: Record<string, PartState> = {};

        for (const part of MEAT_PARTS) {
          const ref = doc(db, "parts", part.id);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data() as any;
            nextState[part.id] = {
              price: data.price ? String(data.price) : "",
              stock:
                typeof data.stock === "number" || typeof data.stock === "string"
                  ? String(data.stock)
                  : "",
            };
          } else {
            nextState[part.id] = { price: "", stock: "" };
          }
        }

        setPartsState(nextState);
      } catch (e) {
        console.error(e);
        setMessage("在庫情報の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      load();
    }
  }, [user]);

  if (user === undefined || loading) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // 非ログイン（上でリダイレクトしているので何も描画しない）
  if (user === null) {
    return null;
  }

  // 管理者チェック
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main style={{ padding: 24 }}>
        <h1>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  async function handleSave(part: MeatPart) {
    const state = partsState[part.id] ?? { price: "", stock: "" };
    setMessage("");

    try {
      await setDoc(
        doc(db, "parts", part.id),
        {
          price: state.price || null,
          stock: state.stock ? Number(state.stock) : null,
        },
        { merge: true }
      );

      setMessage(`${part.name} の在庫情報を保存しました`);
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("保存に失敗しました");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>在庫管理（管理者）</h1>
      <p>ログイン中：{user.email}</p>

      <div style={{ marginTop: 24 }}>
        {MEAT_PARTS.map((part) => {
          const s = partsState[part.id] ?? { price: "", stock: "" };

          return (
            <div
              key={part.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <h2>
                {part.name}（{part.animal}）
              </h2>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{part.description}</p>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label>
                  価格（円/100g）
                  <input
                    type="number"
                    value={s.price}
                    onChange={(e) =>
                      setPartsState((prev) => ({
                        ...prev,
                        [part.id]: { ...prev[part.id], price: e.target.value },
                      }))
                    }
                    style={{ marginLeft: 4, width: 120 }}
                  />
                </label>

                <label>
                  在庫量（g）
                  <input
                    type="number"
                    value={s.stock}
                    onChange={(e) =>
                      setPartsState((prev) => ({
                        ...prev,
                        [part.id]: { ...prev[part.id], stock: e.target.value },
                      }))
                    }
                    style={{ marginLeft: 4, width: 120 }}
                  />
                </label>

                <button onClick={() => handleSave(part)}>保存</button>
              </div>
            </div>
          );
        })}
      </div>

      {message && (
        <p style={{ marginTop: 16, color: message.includes("失敗") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </main>
  );
}
