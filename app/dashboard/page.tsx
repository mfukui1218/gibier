"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const user = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (user === undefined) {
    return <main className={styles.page}>読み込み中...</main>;
  }
  if (user === null) return null;

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>ダッシュボード</h1>
        <p className={styles.email}>ログイン中：{user.email}</p>

        <hr className={styles.divider} />

        <h2 className={styles.sectionTitle}>メニュー</h2>

        <div className={styles.menu}>
          <button className={styles.button} onClick={() => router.push("/home")}>
            HOME
          </button>
          <button className={styles.button} onClick={() => router.push("/gibier")}>
            ジビエ部位一覧へ
          </button>
          <button className={styles.button} onClick={() => router.push("/mypage")}>
            マイページへ
          </button>
          <button className={styles.button} onClick={() => router.push("/request")}>
            ジビエ希望リクエストを書く
          </button>

          <button
            className={`${styles.button} ${styles.logout}`}
            onClick={handleLogout}
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
