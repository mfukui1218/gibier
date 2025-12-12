"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import styles from "./requests.module.css";

/* ---------- status ---------- */
const STATUS_ORDER = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUS_ORDER)[number];

function isStatus(v: unknown): v is Status {
  return v === "pending" || v === "approved" || v === "rejected";
}
function nextStatus(current: Status): Status {
  const i = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
}

/* ---------- parts ---------- */
type PartDoc = { name?: string; animal?: string };
type Part = PartDoc & { id: string };

/* ---------- requests ---------- */
type Profile = { displayName?: string; relationship?: string };

type RequestItem = {
  id: string;
  partId: string;
  amount?: string;
  address?: string;
  createdAt?: any;
  status?: string;
  userId?: string;
  userEmail?: string | null;
  profile?: Profile | null;
};

type EditState = {
  partId: string;
  amount: string;
  address: string;
  status: Status;
};

function RequestRow({
  req,
  partLabel,
  partsLoading,
  onLocalPatch,
}: {
  req: RequestItem;
  partLabel: string;
  partsLoading: boolean;
  onLocalPatch?: (id: string, patch: Partial<RequestItem> & any) => void;
}) {
  const profile = req.profile;

  const statusNow: Status = isStatus(req.status) ? req.status : "pending";
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function cycleStatus() {
    if (saving) return;

    const next = nextStatus(statusNow);

    // 先に親itemsへ反映（即UI更新）
    onLocalPatch?.(req.id, { status: next });

    setSaving(true);
    setMsg("");

    try {
      await updateDoc(doc(db, "requests", req.id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      setMsg("更新しました");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      console.error(e);
      // 失敗したら戻す
      onLocalPatch?.(req.id, { status: statusNow });
      setMsg("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const ok = window.confirm("このリクエストを削除しますか？（元に戻せません）");
    if (!ok) return;

    setSaving(true);
    setMsg("");
    try {
      await deleteDoc(doc(db, "requests", req.id));
      onLocalPatch?.(req.id, { __deleted: true } as any);
    } catch (e) {
      console.error(e);
      setMsg("削除に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className={styles.card}>
      <div className={styles.row}>
        <div className={styles.title}>{partLabel}</div>
        {partsLoading && (
          <div className={styles.miniNote}>部位名読み込み中...</div>
        )}
      </div>

      <div className={styles.meta}>
        <div className={styles.kv}>
          <span className={styles.k}>ID :</span>
          <span className={styles.v}>{req.id}</span>
        </div>

        <div className={styles.kv}>
          <span className={styles.k}>ユーザー :</span>
          <span className={styles.v}>{req.userEmail ?? req.userId ?? "-"}</span>
        </div>

        {profile?.displayName && (
          <div className={styles.kv}>
            <span className={styles.k}>名前 :</span>
            <span className={styles.v}>{profile.displayName}</span>
          </div>
        )}

        {profile?.relationship && (
          <div className={styles.kv}>
            <span className={styles.k}>関係 :</span>
            <span className={styles.v}>{profile.relationship}</span>
          </div>
        )}

        {/* ここからは「表示のみ」 */}
        <div className={styles.kv}>
          <span className={styles.k}>partId :</span>
          <span className={styles.v}>{req.partId ?? "-"}</span>
        </div>

        <div className={styles.kv}>
          <span className={styles.k}>amount :</span>
          <span className={styles.v}>{req.amount ?? "-"} g</span>
        </div>

        <div className={styles.kv}>
          <span className={styles.k}>address :</span>
          <span className={styles.v}>{req.address ?? "-"}</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.statusButton} ${styles[statusNow] ?? ""}`}
            onClick={cycleStatus}
            disabled={saving}
          >
            {saving ? "更新中..." : `状態: ${statusNow}`}
          </button>

          <button
            type="button"
            className={styles.deleteButton}
            onClick={remove}
            disabled={saving}
          >
            削除
          </button>
        </div>

        {msg && (
          <div className={msg.includes("失敗") ? styles.messageError : styles.messageOk}>
            {msg}
          </div>
        )}
      </div>
    </li>
  );
}

export default function AdminRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [partsMap, setPartsMap] = useState<Record<string, Part>>({});
  const [partsLoading, setPartsLoading] = useState(true);

  // requests + users profiles
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "requests"),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);

        const baseList: RequestItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RequestItem, "id">),
        }));

        // userId を集める（重複除去）
        const uids = Array.from(
          new Set(baseList.map((r) => r.userId).filter(Boolean))
        ) as string[];

        // users/{uid} をまとめて読む（並列）
        const profileMap: Record<string, Profile | null> = {};

        await Promise.all(
          uids.map(async (uid) => {
            try {
              const s = await getDoc(doc(db, "users", uid));
              if (!s.exists()) {
                profileMap[uid] = null;
                return;
              }
              const data = s.data() as any;

              // ✅ displayName 統一（displayName が無ければ name をフォールバック）
              profileMap[uid] = {
                displayName: (data.displayName ?? data.name ?? "") as string,
                relationship: (data.relationship ?? "") as string,
              };
            } catch (e) {
              console.error("failed to load user profile:", uid, e);
              profileMap[uid] = null;
            }
          })
        );

        // requests に profile を合成
        const merged: RequestItem[] = baseList.map((r) => ({
          ...r,
          profile: r.userId ? profileMap[r.userId] ?? null : null,
        }));

        setItems(merged);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // parts
  useEffect(() => {
    const loadParts = async () => {
      setPartsLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "parts")));
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

  const labelOf = useMemo(() => {
    return (partId?: string) => {
      if (!partId) return "不明な部位";
      const part = partsMap[partId];
      if (!part) return partId;
      const name = part.name ?? part.id;
      return part.animal ? `${part.animal}：${name}` : name;
    };
  }, [partsMap]);

  // 子から「itemsをローカル更新/削除」するため
  const patchItem = (id: string, patch: Partial<RequestItem> & any) => {
    if (patch.__deleted) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
    );
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
      <h1 className={styles.pageTitle}>リクエスト一覧（管理）</h1>

      <ul className={styles.list}>
        {items.map((req) => (
          <RequestRow
            key={req.id}
            req={req}
            partLabel={labelOf(req.partId)}
            partsLoading={partsLoading}
            onLocalPatch={patchItem}
          />
        ))}
      </ul>
    </main>
  );
}
