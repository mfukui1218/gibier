// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { saveUserProfile } from "@/lib/saveUserProfile";

// 選択肢（relation の候補）
const RELATION_OPTIONS = ["友達", "職場", "家族", "その他"] as const;

// 共通ボタンスタイル（login / signup と統一）
const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  width: "100%",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  transition: "all 0.25s",
  marginTop: 14,
};

// 共通入力スタイル
const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#ffffff",
  color: "#000000",
  fontSize: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

export default function ProfilePage() {
  const user = useAuthUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<string>("友達");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 未ログインなら /login に戻す
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // 既存プロフィールの読み込み
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.name) setName(data.name);
          if (data.relationship) setRelationship(data.relationship);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  if (user === undefined || loading) {
    return (
      <main style={{ padding: 24, textAlign: "center", color: "#fff" }}>
        読み込み中...
      </main>
    );
  }

  if (user === null) {
    return null; // useEffect で /login に飛んでいる
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await saveUserProfile(name, relationship);
      setMessage("プロフィールを保存しました");
      router.push("/home");
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
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
          maxWidth: 400,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          プロフィール登録
        </h1>

        <p
          style={{
            fontSize: 13,
            textAlign: "center",
            marginBottom: 16,
            color: "#ddd",
          }}
        >
          ログイン中：{user.email}
        </p>

        <form
          onSubmit={handleSave}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <label style={{ color: "#fff", fontSize: 14 }}>
            名前
            <input
              type="text"
              placeholder="名前を入力（分かる名前ならなんでも可）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ color: "#fff", fontSize: 14 }}>
            関係
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: 8,
                cursor: "pointer",
              }}
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "default" : "pointer",
            }}
            onMouseOver={(e) => {
              if (saving) return;
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: 12,
              color: message.includes("失敗") ? "#ff8080" : "#b4ffb4",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
