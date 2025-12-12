"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const Map = dynamic(() => import("./TrapMapClient"), { ssr: false });

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

type Status = "active" | "inactive" | "hit" | "removed";

export type Trap = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: Status;
  note?: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function AdminTrapMapEditPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [items, setItems] = useState<Trap[]>([]);
  const [loading, setLoading] = useState(true);

  // クリックした座標（新規追加用）
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);

  // 新規入力
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("active");

  // 認証リダイレクト（render中に router.replace しない）
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "traps")));
      const list: Trap[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const center = useMemo(() => {
    // 奥多摩中心（だいたい）
    return { lat: 35.80, lng: 139.10 };
  }, []);

  if (user === undefined) return <main className="p-6">読み込み中...</main>;
  if (user === null) return null;

  if (!isAdmin) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">アクセス拒否</h1>
        <p>このページは管理者のみ編集できます。</p>
        <button
          className="mt-4 rounded border px-4 py-2 font-semibold"
          onClick={() => router.push("/map")}
          type="button"
        >
          閲覧ページへ
        </button>
      </main>
    );
  }

  async function addTrap() {
    const t = title.trim();
    if (!t) return alert("タイトル必須");
    if (!pick) return alert("地図をクリックして位置を選んで");

    const ref = await addDoc(collection(db, "traps"), {
      title: t,
      note: note.trim() || null,
      status,
      lat: pick.lat,
      lng: pick.lng,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setItems((prev) => [
      ...prev,
      { id: ref.id, title: t, note: note.trim() || "", status, lat: pick.lat, lng: pick.lng },
    ]);

    setTitle("");
    setNote("");
    setStatus("active");
    setPick(null);
  }

  async function updateTrap(id: string, patch: Partial<Trap>) {
    await updateDoc(doc(db, "traps", id), { ...patch, updatedAt: serverTimestamp() });
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function removeTrap(id: string) {
    const ok = window.confirm("削除しますか？（戻せません）");
    if (!ok) return;
    await deleteDoc(doc(db, "traps", id));
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">罠マップ（管理編集）</h1>
        <p className="text-sm text-gray-600"style ={{color: "#ffffff"}}>ログイン中：{user.email}</p>
      </header>

      <section className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-[560px]">
          <Map
            center={center}
            traps={items}
            onPick={(p) => setPick(p)}
            onChangeStatus={(id, next) => updateTrap(id, { status: next })}
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="font-semibold">新規追加</div>

        <div className="text-sm text-gray-600"style ={{color: "#ffffff"}}>
          選択座標：{pick ? `${pick.lat.toFixed(6)}, ${pick.lng.toFixed(6)}` : "-（地図クリック）"}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            タイトル
            <input
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="text-sm">
            状態
            <select
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="active">稼働</option>
              <option value="inactive">停止</option>
              <option value="hit">捕獲</option>
              <option value="removed">撤去</option>
            </select>
          </label>
        </div>

        <label className="text-sm block">
          メモ
          <textarea
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addTrap}
            className="rounded bg-black px-4 py-2 font-semibold text-white"
          >
            追加
          </button>
          <button
            type="button"
            onClick={load}
            className="rounded border border-gray-300 px-4 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "読み込み中..." : "再読み込み"}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <div className="font-semibold">一覧（管理）</div>

        {loading ? (
          <div className="text-sm text-gray-600">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">まだ罠がありません</div>
        ) : (
          <ul className="space-y-2">
            {items.map((t) => (
              <li key={t.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-gray-600">
                      {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
                    </div>
                    {t.note ? <div className="text-sm mt-1">{t.note}</div> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={t.status}
                      onChange={(e) => updateTrap(t.id, { status: e.target.value as Status })}
                    >
                      <option value="active">稼働</option>
                      <option value="inactive">停止</option>
                      <option value="hit">捕獲</option>
                      <option value="removed">撤去</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeTrap(t.id)}
                      className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      削除
                    </button>
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
