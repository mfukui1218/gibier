// app/home/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import styles from "./home.module.css";

type MenuItem = {
  title: string;
  desc: string;
  href: string;
  variant?: "normal" | "logout" | "admin";
};

export default function HomeHubPage() {
  const user = useAuthUser();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  const items: MenuItem[] = [
    { title: "ジビエ肉一覧", desc: "取り扱い中のジビエ肉を見る", href: "/gibier" },
    { title: "とれた獲物・ニュース", desc: "捕獲情報やニュース記事を読む", href: "/harvests" },
    { title: "わなマップ", desc: "設置した罠の位置情報を見る", href: "/map" },
  ];

  // ログイン時だけ出す
  const authedItems: MenuItem[] = user
    ? [
        { title: "マイページ", desc: "ユーザー情報を確認", href: "/mypage" },
        { title: "お問い合わせ", desc: "お問い合わせフォームへ", href: "/contacts" },
        { title: "ログアウト", desc: "サインアウトする", href: "#logout", variant: "logout" },
        { title: "管理者用", desc: "admin画面へ", href: "/admin", variant: "admin" },
      ]
    : [];

  function onClick(item: MenuItem) {
    if (item.href === "#logout") return handleLogout();
    router.push(item.href);
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>HOME</h1>

      <div className={styles.grid}>
        {[...items, ...authedItems].map((item) => {
          const cls =
            item.variant === "logout"
              ? `${styles.card} ${styles.logout}`
              : item.variant === "admin"
              ? `${styles.card} ${styles.adminCard}`
              : styles.card;

          return (
            <div key={item.title} className={cls} onClick={() => onClick(item)}>
              <h2
                className={
                  item.variant === "admin" ? styles.adminTitle : styles.cardTitle
                }
              >
                {item.title}
              </h2>
              <p
                className={
                  item.variant === "admin" ? styles.adminDesc : styles.cardDesc
                }
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
