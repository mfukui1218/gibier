// app/parts/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./page.module.css";

type PartDoc = {
  name?: string;
  animal?: string;
  description?: string;
  imageUrl?: string; // ← Firestore 側は imageUrl に統一推奨
  price?: string | number; // "1800" / 1800 / "1,800" など色々来てもOKにする
  stock?: number; // g の想定（運用に合わせて単位は変えてOK）
};

function formatPrice(price: PartDoc["price"]) {
  if (price === undefined || price === null || price === "") return "";
  if (typeof price === "number") return price.toLocaleString();
  // 文字列の "1,800円" みたいなのも来る可能性があるので、できるだけ崩さない
  return String(price).replace(/円\s*\/\s*100g$/g, "").trim();
}

export default function PartPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const rawId = params?.id;
  const id = useMemo(() => (Array.isArray(rawId) ? rawId[0] : rawId), [rawId]);

  const [part, setPart] = useState<(PartDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "parts", id));
        if (snap.exists()) {
          setPart({ id: snap.id, ...(snap.data() as PartDoc) });
        } else {
          setPart(null);
        }
      } catch (e) {
        console.error(e);
        setPart(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // id がまだ取れてない
  if (!id) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  // ロード中
  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  // Firestore に存在しない
  if (!part) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>部位詳細</h1>
          <p className={styles.text}>この部位は登録されていません。</p>
          <button onClick={() => router.push("/gibier")} className={styles.button}>
            ホームに戻る
          </button>
        </div>
      </main>
    );
  }

  const name = part.name ?? "名称未登録";
  const animal = part.animal ?? "";
  const desc = part.description ?? "説明未登録";
  const img = part.imageUrl || "/images/placeholder.png";

  const priceText = formatPrice(part.price);
  const stockText =
    typeof part.stock === "number" ? `${part.stock} g` : "";

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2 className={styles.partTitle}>
          {name}
          {animal ? `（${animal}）` : ""}
        </h2>

        <div className={styles.imageWrapper}>
          <img
            src={img}
            alt={`${animal} ${name}`.trim()}
            className={styles.image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <p className={styles.description}>{desc}</p>

        <div className={styles.infoBox}>
          <p className={styles.text}>
            <strong>値段：</strong>
            {priceText ? `${priceText}円 / 100g` : "未登録"}
          </p>

          <p className={styles.text}>
            <strong>在庫：</strong>
            {stockText || "未登録"}
          </p>

          <div className={styles.actionRow}>
            <button
              onClick={() => router.push(`/request?partId=${part.id}`)}
              className={styles.button}
            >
              この部位が欲しい
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
