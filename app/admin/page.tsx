// app/admin/page.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuthUser } from "@/hooks/useAuthUser";
import { app } from "@/lib/firebase";
import { saveAdminFcmToken} from "@/lib/saveAdminFcmToken";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import styles from "./admin.module.css";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

type MenuItem = { title: string; desc: string; href: string };

const ADMIN_MENU: MenuItem[] = [
  { title: "在庫管理", desc: "各部位の価格と在庫量を編集", href: "/admin/stock" },
  { title: "許可メール管理", desc: "登録を許可するメールアドレスの確認・追加", href: "/admin/allowed" },
  { title: "収穫物・ニュース", desc: "収穫物・ニュースの確認・追加", href: "/admin/harvestspost" },
  { title: "リクエスト一覧", desc: "希望 g・住所付きの「欲しいリクエスト」を確認", href: "/admin/requestlist" },
  { title: "わなマップ編集", desc: "罠マップを編集します", href: "/admin/mapEdit" },
  { title: "問い合わせ一覧", desc: "/contact から送られた問い合わせ内容を確認", href: "/admin/contacts" },
  { title: "HOME", desc: "HOMEに戻る", href: "/home" },
];

function MenuCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <h2 className={styles.cardTitle}>{item.title}</h2>
      <p className={styles.cardDesc}>{item.desc}</p>
    </div>
  );
}

export default function AdminTopPage() {
  const user = useAuthUser();
  const router = useRouter();
  const didInitNotif = useRef(false);

  const isAdmin = useMemo(() => {
    return (user?.email ?? "").toLowerCase() === ADMIN_EMAIL;
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (didInitNotif.current) return;
      if (!user || !isAdmin) return;

      if (!("serviceWorker" in navigator)) {
        console.log("No serviceWorker env");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
      if (!vapidKey) {
        console.error("Missing env: NEXT_PUBLIC_FCM_VAPID_KEY");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission:", permission);
        return;
      }

      // 保存失敗で無限リトライしない
      didInitNotif.current = true;

      const messaging = getMessaging(app);
      const swReg = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (!token) {
        console.error("No FCM token available");
        return;
      }

      await saveAdminFcmToken({
        uid: user.uid,
        email: user.email ?? "",
        token,
      });
    };

    run().catch((e) => console.error("Notif init failed:", e));
  }, [user, isAdmin]);

  if (user === undefined) return <main style={{ padding: 24 }}>読み込み中...</main>;

  if (user === null) {
    router.replace("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <main style={{ padding: 24 }}>
        <h1>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>管理メニュー</h1>
          <p className={styles.sub}>ログイン中：{user.email}</p>
          <p className={styles.note}>※ 通知を許可すると管理者通知を受け取れます</p>
        </header>

        <div className={styles.grid}>
          {ADMIN_MENU.map((item) => (
            <MenuCard key={item.href} item={item} onClick={() => router.push(item.href)} />
          ))}
        </div>
      </div>
    </main>
  );
}
