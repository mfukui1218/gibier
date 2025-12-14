"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";
import styles from "./harvests.module.css";

type Harvest = {
  id: string;
  title: string;
  summary: string;
  date?: any;
  imageUrl?: string;
};

export default function HarvestsPage() {
  const user = useAuthUser();
  const [items, setItems] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (user === undefined) return;

    if (user === null) {
      setLoading(false);
      setErr("ログインしてください");
      return;
    }

    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const q = query(collection(db, "harvests"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const list: Harvest[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setItems(list);
      } catch (e: any) {
        console.error("harvests load failed:", e);
        setErr(e?.message ?? "読み込みに失敗しました");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>とれた獲物の記録・ニュース</h1>

      <p className={styles.subtitle}>
        捕獲日や部位、写真などの情報をニュース形式で掲載しています。
      </p>

      {loading ? (
        <p className={styles.loading}>読み込み中...</p>
      ) : err ? (
        <p className={styles.error}>{err}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <p className={styles.date}>
                {item.date?.toDate?.()
                  ? item.date.toDate().toLocaleDateString("ja-JP")
                  : ""}
              </p>

              <div className={styles.row}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.thumb}
                  />
                ) : null}

                <div>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.summary}>{item.summary}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
