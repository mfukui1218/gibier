"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./TrapMapPage.module.css";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import { useAuthUser } from "@/hooks/useAuthUser";

const Map = dynamic(() => import("./ui/TrapMapClient"), { ssr: false });

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

type Status = "active" | "inactive" | "hit" | "removed";

type Trap = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: Status;
  note?: string;
  lastCheckedAt?: any;
  createdAt?: any;
  updatedAt?: any;
};

function isStatus(v: any): v is Status {
  return v === "active" || v === "inactive" || v === "hit" || v === "removed";
}

export default function TrapMapPage() {
  const user = useAuthUser();
  const isAdmin = (user?.email ?? "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [items, setItems] = useState<Trap[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "traps"));
      const list: Trap[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title ?? "(no title)",
          lat: Number(data.lat ?? 0),
          lng: Number(data.lng ?? 0),
          status: isStatus(data.status) ? data.status : "inactive",
          note: data.note ?? "",
          lastCheckedAt: data.lastCheckedAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user === undefined) return;        // ✅ 認証判定中は待つ
    if (user === null) {                   // ✅ 未ログインなら読まない
      setLoading(false);
      setErr("ログインしてください");
      return;
    }
    load();
  }, [user]);

  const center = useMemo(() => {
    if (items[0]) return { lat: items[0].lat, lng: items[0].lng };
    return { lat: 35.681236, lng: 139.767125 }; // 東京駅
  }, [items]);

  async function updateTrap(id: string, patch: Partial<Trap>) {
    if (!isAdmin) return;
    await updateDoc(doc(db, "traps", id), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function removeTrap(id: string) {
    if (!isAdmin) return;
    const ok = window.confirm("削除しますか？");
    if (!ok) return;

    await deleteDoc(doc(db, "traps", id));
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>わなマップ</h1>
      </header>

      {/* 地図 */}
      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <Map traps={items} />
        </div>
      </section>

      {/* 一覧 */}
      <section className={styles.listSection}>
        <div className={styles.listTitle}>一覧</div>

        {loading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>まだ罠がありません</div>
        ) : (
          <ul className={styles.list}>
            {items.map((t) => (
              <li key={t.id} className={styles.item}>
                <div className={styles.itemRow}>
                  <div>
                    <div className={styles.itemTitle}>{t.title}</div>
                    <div className={styles.coords}>
                      {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
                    </div>
                    {t.note && (
                      <div className={styles.note}>{t.note}</div>
                    )}
                  </div>
                  <div className={styles.status}>状態: {t.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
