"use client";

import { useEffect, useMemo, useState } from "react";
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
    load();
  }, []);

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
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">わなマップ</h1>

      </header>

      {/* 地図 */}
      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-[520px]">
          <Map traps={items} />
        </div>
      </section>

      {/* 一覧 */}
      <section className="space-y-3">
        <div className="font-semibold">一覧</div>

        {loading ? (
          <div className="text-sm text-gray-600">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">まだ罠がありません</div>
        ) : (
          <ul className="space-y-2">
            {items.map((t) => (
              <li key={t.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-gray-600"style ={{color: "#ffffff"}}>
                      {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
                    </div>
                    {t.note ? <div className="text-sm mt-1">{t.note}</div> : null}
                  </div>
                  <div className="text-sm"style ={{color: "#ffffff"}}>
                    状態: {t.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
