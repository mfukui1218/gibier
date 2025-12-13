// app/admin/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { CSSProperties } from "react";
import { saveAdminFcmToken } from "@/lib/saveAdminFcmToken";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

// ★ できれば env に寄せる（Vercelにも入れる）
// const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "ttnetnzua@gmail.com";
const ADMIN_EMAIL = "ttnetnzua@gmail.com";

// 共通カードスタイル
const cardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(8px)",
};

// ページ全体
const mainStyle: CSSProperties = {
  padding: 24,
  display: "flex",
  justifyContent: "center",
};

const innerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "rgba(0,0,0,0.35)",
  borderRadius: 16,
  padding: 24,
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  color: "#fff",
};

export default function AdminTopPage() {
  const user = useAuthUser();
  const router = useRouter();

  // ★ 何度も permission / getToken しないため
  const didInitNotif = useRef(false);

  // ★ 管理者だけ通知トークン取得
  useEffect(() => {
    const run = async () => {
      if (didInitNotif.current) return;
      if (!user) return;
      if (user.email !== ADMIN_EMAIL) return;

      // SWが無い環境は不可
      if (!("serviceWorker" in navigator)) return;

      // VAPID KEY 必須
      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
      if (!vapidKey) {
        console.error("Missing env: NEXT_PUBLIC_FCM_VAPID_KEY");
        return;
      }

      // 通知許可（ユーザーが拒否したら終了）
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission:", permission);
        return;
      }

      const messaging = getMessaging(app);

      // トークン取得（SW登録済み前提）
      const swReg = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (!token) {
        console.error("No FCM token available");
        return;
      }

      didInitNotif.current = true;
      console.log("ADMIN FCM token:", token);
      await saveAdminFcmToken(user.uid, token);

      // TODO: ここで Firestore 等に保存（次のステップ）
      // await saveAdminFcmToken(user.uid, token);

      // （任意）フォアグラウンド受信ログ
      onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);
            
        // フォアグラウンドでも通知を出す（iOS Safari/PWAで重要）
        if (Notification.permission !== "granted") return;
            
        const title = payload.notification?.title ?? "通知";
        const body = payload.notification?.body ?? "";
            
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
          data: payload.data ?? {},
        });
      });
    };

    run().catch((e) => console.error("Notif init failed:", e));
  }, [user]);

  // 認証状態読み込み中
  if (user === undefined) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // 未ログインなら /login へ
  if (user === null) {
    router.replace("/login");
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

  return (
    <main style={mainStyle}>
      <div style={innerStyle}>
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            管理メニュー
          </h1>
          <p style={{ fontSize: 13, color: "#ddd" }}>
            ログイン中：{user.email}
          </p>
          <p style={{ fontSize: 12, color: "#bbb", marginTop: 6 }}>
            ※ 通知を許可すると管理者通知を受け取れます（許可ダイアログが出ます）
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {/* 在庫管理 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/stock")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>在庫管理</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              各部位の価格と在庫量を編集
            </p>
          </div>

          {/* 許可メール */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/allowed")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>許可メール管理</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              登録を許可するメールアドレスの確認・追加
            </p>
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/harvestspost")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>収穫物・ニュース</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              収穫物・ニュースの確認・追加
            </p>
          </div>

          {/* リクエスト一覧 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/requestlist")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>リクエスト一覧</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              希望 g・住所付きの「欲しいリクエスト」を確認
            </p>
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/mapEdit")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>わなマップ編集</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              罠マップを編集します
            </p>
          </div>

          {/* 問い合わせ一覧 */}
          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/admin/contacts")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>問い合わせ一覧</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              /contact から送られた問い合わせ内容を確認
            </p>
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => router.push("/home")}
          >
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>HOME</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              HOMEに戻る
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
