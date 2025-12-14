"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { saveUserProfile } from "@/lib/saveUserProfile";
import "./profile.css";

const RELATION_OPTIONS = ["友達", "職場", "家族", "その他"] as const;

export default function ProfilePage() {
  const user = useAuthUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("友達");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 未ログインは login へ
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // プロフィール読み込み
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;

          // ✅ name に統一（過去の displayname があれば一度だけ拾う）
          const n = (data.name ?? data.displayname ?? "").toString();
          if (n) setName(n);

          if (data.relationship) setRelationship(data.relationship);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (user === undefined || loading) {
    return <main className="profile-root">読み込み中...</main>;
  }
  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await saveUserProfile(name, relationship);
      setMessage("プロフィールを保存しました");
      router.push("/home");
    } catch (e) {
      console.error(e);
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-root">
      <div className="profile-card ui-glass">
        <h1 className="profile-title">プロフィール登録</h1>

        <p className="profile-subtitle">ログイン中：{user.email}</p>

        <form onSubmit={handleSave} className="profile-form">
          <label className="profile-label">
            名前
            <input
              type="text"
              placeholder="名前を入力（分かる名前ならなんでも可）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="ui-input"
            />
          </label>

          <label className="profile-label">
            関係
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="ui-input ui-select"
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={saving} className="ui-button">
            {saving ? "保存中..." : "保存"}
          </button>
        </form>

        {message ? (
          <p className={message.includes("失敗") ? "ui-message-ng" : "ui-message-ok"}>
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
