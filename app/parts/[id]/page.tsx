// app/parts/[id]/page.tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MEAT_PARTS } from "@/lib/meatParts";

// 共通ボタン風スタイル（他ページに合わせる）
const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.25s",
};

export default function PartPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // useParams の戻り値から id を取り出し（string | string[] の可能性に対応）
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const base = MEAT_PARTS.find((p) => p.id === id);

  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore から値段・在庫を読む
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const ref = doc(db, "parts", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.price) setPrice(data.price);
          if (typeof data.stock === "number") setStock(data.stock);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // id がまだ取れてない
  if (!id) {
    return (
      <main style={{ padding: 24, color: "#fff" }}>
        読み込み中...
      </main>
    );
  }

  // 該当する部位が MEAT_PARTS にない
  if (!base) {
    return (
      <main
        style={{
          padding: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            background: "rgba(0,0,0,0.4)",
            borderRadius: 16,
            padding: 24,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            部位詳細
          </h1>
          <p style={{ marginBottom: 16 }}>この部位は登録されていません。</p>
          <button
            onClick={() => router.push("/gibier")}
            style={buttonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ホームに戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          background: "rgba(0,0,0,0.4)",
          borderRadius: 16,
          padding: 24,
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          {base.name}（{base.animal}）
        </h2>

        <div
          style={{
            marginTop: 8,
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={base.imageSrc}
            alt={base.name}
            style={{
              width: 360,
              height: 260,
              objectFit: "cover",
              borderRadius: 12,
              boxShadow: "0 8px 20px rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 20,
          }}
        >
          {base.description}
        </p>

        <div
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
          }}
        >
          {loading ? (
            <p>在庫情報読み込み中...</p>
          ) : (
            <>
              <p style={{ marginBottom: 8 }}>
                <strong>値段の相場：</strong>
                {price ? `${price}円 / 100g` : "未登録"}
              </p>
              <p style={{ marginBottom: 16 }}>
                <strong>在庫：</strong>
                {stock !== null ? `${stock} g` : "未登録"}
              </p>

              <div style={{ marginTop: 4, textAlign: "right" }}>
                <button
                  onClick={() => router.push(`/request?partId=${base.id}`)}
                  style={buttonStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  この部位が欲しい
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
