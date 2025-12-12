// app/home/page.tsx
"use client";

import { type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 14,
  padding: "20px 24px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
  backdropFilter: "blur(6px)",
  cursor: "pointer",
  transition: "all 0.25s",
  color: "#fff",
};

export default function HomeHubPage() {
  const user = useAuthUser();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        color: "#fff",
      }}
    >
      {/* タイトル */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 30,
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        HOME
      </h1>

      {/* メニュー全体を広く使うグリッド */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          width: "100%",
        }}
      >
        {/* 1カード：ジビエ肉 */}
        <div
          style={cardStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={() => router.push("/gibier")}
        >
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>ジビエ肉一覧</h2>
          <p style={{ fontSize: 14, opacity: 0.75 }}>
            取り扱い中のジビエ肉を見る
          </p>
        </div>

        {/* とれた獲物（ニュース） */}
        <div
          style={cardStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={() => router.push("/harvests")}
        >
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>とれた獲物・ニュース</h2>
          <p style={{ fontSize: 14, opacity: 0.75 }}>
            捕獲情報やニュース記事を読む
          </p>
        </div>

        {/* 罠マップ */}
        <div
          style={cardStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={() => router.push("/map")}
        >
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>わなマップ</h2>
          <p style={{ fontSize: 14, opacity: 0.75 }}>
            設置した罠の位置情報を見る
          </p>
        </div>

        {/* マイページ・ログアウト（ログイン時のみ） */}
        {user && (
          <>
            <div
              style={cardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => router.push("/mypage")}
            >
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>マイページ</h2>
              <p style={{ fontSize: 14, opacity: 0.75 }}>ユーザー情報を確認</p>
            </div>
			<div
				style={cardStyle}
				onMouseOver={(e) => {
				  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
				  e.currentTarget.style.transform = "translateY(-3px)";
				}}
				onMouseOut={(e) => {
				  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
				  e.currentTarget.style.transform = "translateY(0)";
				}}
				onClick={() => router.push("/contacts")}
				>
				<h2 style={{ fontSize: 20, marginBottom: 6 }}>お問い合わせ</h2>
				<p style={{ fontSize: 14, opacity: 0.75 }}>
				  お問い合わせフォームへ
				</p>
			</div>

            <div
              style={{
				  ...cardStyle,
				  borderColor: "rgba(255,150,150,0.7)",
				}}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,120,120,0.3)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={handleLogout}
            >
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>ログアウト</h2>
              <p style={{ fontSize: 14, opacity: 0.75 }}>サインアウトする</p>
        </div>
		<div
		  style={{
		    display: "grid",
		    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
		    gap: 14,
		    width: "1%",
		  }}
		>
		  <div
		    style={{
		      padding: "1px 2px",
		      background: "rgba(255,255,255,0.12)",
		      borderRadius: 10,
		      cursor: "pointer",
		      transition: "all 0.2s",
		      boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
		      textAlign: "center",
		    }}
		    onMouseOver={(e) => {
		      e.currentTarget.style.background = "rgba(255,255,255,0.22)";
		      e.currentTarget.style.transform = "translateY(-2px)";
		    }}
		    onMouseOut={(e) => {
		      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
		      e.currentTarget.style.transform = "translateY(0)";
		    }}
		    onClick={() => router.push("/admin")}
		  >
		    <h2 style={{ fontSize: 10, marginBottom: 4 }}>管理者用</h2>
		  </div>
		</div>
		
          </>
        )}
      </div>
    </main>
  );
}



