"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

type AdminNotification = {
  id: string;
  type?: "request" | "contact" | string;
  title?: string;
  body?: string;
  read?: boolean;
  createdAt?: any;
};

function formatTime(ts: any) {
  try {
    const d = ts?.toDate?.();
    if (!d) return "";
    return d.toLocaleString("ja-JP");
  } catch {
    return "";
  }
}

export default function AdminNotificationsPage() {
  const user = useAuthUser();
  const router = useRouter();
  const isAdmin = (user?.email ?? "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // 認証リダイレクトは useEffect で
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  async function load() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "adminNotifications"),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);
      const list: AdminNotification[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((x) => x.read !== true).length,
    [items]
  );

  async function markRead(id: string) {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "adminNotifications", id), {
        read: true,
        readAt: serverTimestamp(),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    } catch (e) {
      console.error(e);
      alert("既読に失敗しました");
    }
  }

  async function markAllRead() {
    if (!isAdmin) return;
    const targets = items.filter((x) => x.read !== true);
    if (targets.length === 0) return;

    try {
      await Promise.all(
        targets.map((n) =>
          updateDoc(doc(db, "adminNotifications", n.id), {
            read: true,
            readAt: serverTimestamp(),
          })
        )
      );
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (e) {
      console.error(e);
      alert("一括既読に失敗しました");
    }
  }

  async function remove(id: string) {
    if (!isAdmin) return;
    const ok = window.confirm("この通知を削除しますか？");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "adminNotifications", id));
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }

  if (user === undefined) return <main className="p-6">読み込み中...</main>;
  if (user === null) return null;

  if (!isAdmin) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">アクセス拒否</h1>
        <p>このページは管理者のみです。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">通知（管理）</h1>
          <p className="text-sm text-white mt-1">
            未読: <span className="font-semibold">{unreadCount}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={markAllRead}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-semibold"
          >
            すべて既読
          </button>
          <button
            type="button"
            onClick={load}
            className="rounded bg-black px-3 py-2 text-sm font-semibold text-white"
          >
            再読み込み
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-sm text-gray-600">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-600">通知はありません。</div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const isUnread = n.read !== true;
            return (
              <li
                key={n.id}
				className={`rounded-xl border p-4 ${
				  isUnread ? "border-black/20 bg-transparent" : "border-gray-200 bg-transparent"
				}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      ) : null}
                      <div className="font-semibold truncate">
                        {n.title ?? "(no title)"}
                      </div>
                      <div className="text-xs text-white">
                        {n.type ?? "unknown"}
                      </div>
                    </div>

                    {n.body ? (
                      <div className="text-sm text-white mt-1 whitespace-pre-wrap">
                        {n.body}
                      </div>
                    ) : null}

                    <div className="text-xs text-white mt-2">
                      {formatTime(n.createdAt)}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-semibold"
                      >
                        既読
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => remove(n.id)}
                      className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
