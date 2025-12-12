"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import styles from "./requests.module.css";

// parts
type PartDoc = { name?: string; animal?: string };
type Part = PartDoc & { id: string };

// requests
type RequestItem = {
  id: string;
  partId: string;
  amount?: string;
  address?: string;
  createdAt?: any;
  status?: string;
  userId?: string;
  userEmail?: string | null;
  profile?: { name?: string; relationship?: string } | null;
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [partsMap, setPartsMap] = useState<Record<string, Part>>({});
  const [partsLoading, setPartsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 最新順に取得（index無ければ orderBy 外す）
        const q = query(
          collection(db, "requests"),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);

        const list: RequestItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RequestItem, "id">),
        }));

        setItems(list);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadParts = async () => {
      setPartsLoading(true);
      try {
        const q = query(
          collection(db, "parts"),
        );
        const snap = await getDocs(q);

        const map: Record<string, Part> = {};
        snap.docs.forEach((d) => {
          map[d.id] = { id: d.id, ...(d.data() as PartDoc) };
        });

        setPartsMap(map);
      } catch (e) {
        console.error(e);
        setPartsMap({});
      } finally {
        setPartsLoading(false);
      }
    };

    loadParts();
  }, []);

  const labelOf = (partId?: string) => {
    if (!partId) return "不明な部位";
    const part = partsMap[partId];
    if (!part) return partId;
    const name = part.name ?? part.id;
    return part.animal ? `${part.animal}：${name}` : name;
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>読み込み中...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>リクエスト一覧</h1>

      <ul className={styles.list}>
        {items.map((req) => {
          const profile = req.profile;
          const partLabel = labelOf(req.partId);
          const status = req.status ?? "未設定";
          const isDone = status === "done";

          return (
            <li
              key={req.id}
              className={`${styles.card} ${isDone ? styles.cardDone : ""}`}
            >
              <div className={styles.row}>
                <div className={styles.title}>{partLabel}</div>
                {partsLoading && (
                  <div className={styles.miniNote}>部位名読み込み中...</div>
                )}
              </div>

              <div className={styles.meta}>
                <div>希望量: {req.amount ?? "-"} g</div>
                <div>ユーザー: {req.userEmail ?? req.userId ?? "-"}</div>
                {profile?.name && <div>名前: {profile.name}</div>}
                {profile?.relationship && <div>関係: {profile.relationship}</div>}
                <div>状態: {status}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
