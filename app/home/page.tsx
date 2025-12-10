// app/home/page.tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MeatPart = {
  id: string;
  name: string;
  animal: "シカ" | "イノシシ" | "アナグマ" | "マガモ" | "";
  description: string;
  imageSrc: string; // public 配下のパス
};

const MEAT_PARTS: MeatPart[] = [
  {
    id: "deer-loin",
    name: "ロース",
    animal: "シカ",
    description: "ステーキやロースト向きのやわらかい部位。",
    imageSrc: "/images/deer-loin.png",
  },
  {
    id: "deer-thigh",
    name: "モモ",
    animal: "シカ",
    description: "脂少なめで赤身しっかり。焼き・煮込みどちらも可。",
    imageSrc: "/images/deer-thigh.png",
  },
  {
    id: "deer-liver",
    name: "レバー（肝）",
    animal: "シカ",
    description: "鉄分たっぷり。焼き・炒め物に向く。鮮度管理が重要。",
    imageSrc: "/images/deer-liver.png",
  },
  {
    id: "deer-heart",
    name: "ハツ（心臓）",
    animal: "シカ",
    description: "歯ごたえが良く、クセが少ない。焼肉・炒め物に最適。",
    imageSrc: "/images/deer-heart.png",
  },
  {
    id: "duck-magamo",
    name: "マガモ",
    animal: "",
    description: "鉄分豊富で旨味が強い。ロースト・鍋・燻製に向く。",
    imageSrc: "/images/duck-magamo.png",
  },
  {
    id: "anaguma",
    name: "アナグマ",
    animal: "",
    description: "脂が非常に甘く、煮込み・シチューに向く希少肉。",
    imageSrc: "/images/anaguma.png",
  },
  {
    id: "boar-belly",
    name: "バラ",
    animal: "イノシシ",
    description: "脂しっかり。焼肉・角煮・シチューに。",
    imageSrc: "/images/boar-belly.png",
  },
  {
    id: "boar-shoulder",
    name: "肩ロース",
    animal: "イノシシ",
    description: "脂と赤身のバランスが良い万能部位。",
    imageSrc: "/images/boar-shoulder.png",
  },
];

// カードのスタイル
const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: 16,
  padding: 12,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
  cursor: "pointer",
  textAlign: "left",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

// ダッシュボードボタン風
const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.25s",
};

export default function HomePage() {
  const user = useAuthUser();
  const router = useRouter();

  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // 未ログインなら /login に飛ばす
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // プロフィール取得
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.name) {
            setProfileName(data.name);
          }
        }
      } catch (e) {
        console.error("profile load error", e);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // 認証状態の判定中
  if (user === undefined) {
    return (
      <main style={{ padding: 24, textAlign: "center", color: "#fff" }}>
        読み込み中...
      </main>
    );
  }

  // 未ログイン（上の useEffect で /login に飛んでいる）
  if (user === null) {
    return null;
  }

  function handleClick(part: MeatPart) {
    router.push(`/parts/${part.id}`);
  }

  const displayName =
    profileLoading ? "読み込み中..." : profileName ?? user.email;

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
          maxWidth: 1000,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
              textShadow: "0 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            ジビエ部位一覧
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#eee",
            }}
          >
            {displayName} でログイン中
          </p>
        </header>

        {/* グリッドで部位カードを並べる */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 18,
          }}
        >
          {MEAT_PARTS.map((part) => (
            <button
              key={part.id}
              onClick={() => handleClick(part)}
              style={cardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.35)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  overflow: "hidden",
                  borderRadius: 10,
                  marginBottom: 8,
                  background: "#eee",
                }}
              >
                <img
                  src={part.imageSrc}
                  alt={`${part.animal} ${part.name}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#777",
                    marginBottom: 2,
                  }}
                >
                  {part.animal}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#333",
                  }}
                >
                  {part.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#555",
                    marginTop: 4,
                  }}
                >
                  {part.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 下部ナビ */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
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
            ダッシュボードへ
          </button>
        </div>
      </div>
    </main>
  );
}
