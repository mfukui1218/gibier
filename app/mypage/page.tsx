"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { useAuthUser } from "@/hooks/useAuthUser";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import "./mypage.css";

type UserProfile = {
  name?: string;
  relationship?: string;
};

export default function MyPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // ✅ Firestore の users/{uid} を読んで name を取る
  useEffect(() => {
    if (!user) return; // undefined / null は待つ

    const load = async () => {
      setProfileLoading(true);
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        setProfile(snap.exists() ? (snap.data() as any) : {});
      } catch (e) {
        console.error("profile load failed:", e);
        setProfile({});
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, [user]);

  if (user === undefined) return null;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const displayName = profileLoading
    ? "読み込み中..."
    : (profile?.name ?? "未設定");

  return (
    <main className="mypage-root">
      <div className="mypage-container">
        <h1 className="mypage-title">マイページ</h1>
        <p className="mypage-subtitle">ログイン中のユーザー情報とメニューです。</p>

        {/* ユーザー情報 */}
        <section className="mypage-section">
          <h2 className="mypage-section-title">ユーザー情報</h2>
          <div className="user-card">
            <p>
              <span>メールアドレス:</span> {user.email ?? "未設定"}
            </p>
            <p>
              <span>表示名:</span> {displayName}
            </p>
          </div>
        </section>

        {/* メニュー */}
        <section>
          <h2 className="mypage-section-title">メニュー</h2>

          <div className="menu-grid">

            <Link href="/home" className="glass-card">
              <h3>HOME</h3>
              <p>HOMEに戻る</p>
            </Link>

            <button onClick={handleLogout} className="glass-card danger-card">
              <h3>ログアウト</h3>
              <p>サインアウトする</p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
