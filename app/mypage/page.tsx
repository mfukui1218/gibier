// app/mypage/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { useAuthUser } from "@/hooks/useAuthUser";
import { auth } from "@/lib/firebase";

const cardBase =
  "block rounded-xl border border-black/10 bg-white px-6 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition text-left";

const glassCard =
  "block rounded-xl border border-white/40 bg-white/20 backdrop-blur-md px-6 py-4 shadow-md transition hover:bg-white/30 hover:-translate-y-0.5";


export default function MyPage() {
  const user = useAuthUser();
  const router = useRouter();

  // 未ログインなら login へリダイレクト
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (user === undefined) return null;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* タイトル */}
        <h1 className="mb-2 text-3xl font-bold">マイページ</h1>
        <p className="mb-8 text-sm text-gray-700"style={{color : "#ffffff", }}>
          ログイン中のユーザー情報とメニューです。
        </p>

        {/* ユーザー情報 */}
        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold">ユーザー情報</h2>
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm text-black">
            <p className="mb-1">
              <span className="text-gray-500">メールアドレス:</span>{" "}
              {user.email ?? "未設定"}
            </p>
            <p>
              <span className="text-gray-500">表示名:</span>{" "}
              {user.displayName ?? "未設定"}
            </p>
          </div>
        </section>

        {/* メニューカード */}
        <section>
          <h2 className="mb-3 text-lg font-semibold"style={{color : "#ffffff", }}>メニュー</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            <Link href="/profile" className={glassCard}>
			  <h3 className="text-base font-semibold text-black mb-1"style={{color : "#ffffff", }}>プロフィール設定</h3>
			  <p className="text-xs text-gray-700"style={{color : "#ffffff", }}>設定を変更できます。</p>
			</Link>
			
			{/* HOME */}
			<Link href="/home" className={glassCard}>
			  <h3 className="text-base font-semibold text-black mb-1"style={{color : "#ffffff", }}>HOME</h3>
			  <p className="text-xs text-gray-700"style={{color : "#ffffff", }}>HOMEに戻る</p>
			</Link>

            {/* ログアウト */}
			<button
			  onClick={handleLogout}
			  className={`${glassCard} border-red-300`}
			>
			  <h3 className="text-base font-semibold text-red-600 mb-1">ログアウト</h3>
			  <p className="text-xs text-red-500">サインアウトする</p>
			</button>
          </div>
        </section>
      </div>
    </main>
  );
}
