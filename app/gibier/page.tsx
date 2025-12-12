// app/gibier/page.tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MeatPart = {
  id: string;
  name: string;
  animal: string; // DB からそのまま文字列で
  description: string;
  imageUrl: string; // Firestore の imageUrl フィールド
};

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

// ダッシュボタン風
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

  const [parts, setParts] = useState<MeatPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);

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

  // 部位一覧を DB から取得
  useEffect(() => {
    const loadParts = async () => {
      if (!user) return;
      setPartsLoading(true);
      try {
        const colRef = collection(db, "parts");
        const snap = await getDocs(colRef);

        const nextParts: MeatPart[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? "",
            animal: data.animal ?? "",
            description: data.description ?? "",
            imageUrl: data.imageUrl ?? "",
          };
        });

        // 動物種 + 名前でソート（お好みで）
        nextParts.sort((a, b) =>
          `${a.animal}${a.name}`.localeCompare(
            `${b.animal}${b.name}`,
            "ja"
          )
        );

        setParts(nextParts);
      } catch (e) {
        console.error("parts load error", e);
      } finally {
        setPartsLoading(false);
      }
    };

    if (user) {
      loadParts();
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
        {partsLoading ? (
          <p style={{ fontSize: 14 }}>部位を読み込み中...</p>
        ) : parts.length === 0 ? (
          <p style={{ fontSize: 14 }}>登録されている部位がありません。</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 18,
            }}
          >
            {parts.map((part) => (
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
                    src={part.imageUrl || "/images/placeholder.png"}
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
        )}

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
