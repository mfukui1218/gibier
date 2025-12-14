"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { deleteDoc , doc} from "firebase/firestore";
import { ref} from "firebase/storage";

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { uploadHarvestImage } from "./uploadImage";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

type Harvest = {
  id: string;
  title: string;
  summary: string;
  body?: string;
  date?: any;
  imageUrl?: string;
  imagePath?: string; // ← 追加
  createdAt?: any;
};

import { deleteObject, ref as storageRef } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function AdminHarvestsPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  async function loadList() {
    setLoading(true);
    try {
      const q = query(collection(db, "harvests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: Harvest[] = snap.docs.map((d) => ({
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
  async function handleDelete(item: Harvest) {
  const ok = window.confirm(`「${item.title}」を削除しますか？（元に戻せません）`);
    if (!ok) return;

    try {
      // ① Firestore を削除
      await deleteDoc(doc(db, "harvests", item.id));

      // ② Storage を削除（path がある場合のみ）
      if (item.imagePath) {
        const imageRef = ref(storage, item.imagePath);
        await deleteObject(imageRef);
      }

    
      // ③ 画面から即消す
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  }

  // ✅ redirect（render中にrouter.replaceしない）
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // ✅ 管理者だけロード
  useEffect(() => {
    if (!isAdmin) return;
    loadList();
  }, [isAdmin]);

  // ---- ここから下で return 分岐 ----
  if (user === undefined) return <main className="p-6">読み込み中...</main>;
  if (user === null) return null;

  if (!isAdmin) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const t = title.trim();
    const s = summary.trim();
    if (!t) return setMessage("タイトルは必須です");
    if (!s) return setMessage("概要は必須です");

    setPosting(true);
    try {
      let imageUrl = "";
      let imagePath = "";

      if (file) {
        const img = await uploadHarvestImage(file);
        imageUrl = img.url;
        imagePath = img.path;
      }

      const date =
        dateStr.trim() !== "" ? Timestamp.fromDate(new Date(dateStr)) : null;

      await addDoc(collection(db, "harvests"), {
        title: t,
        summary: s,
        body: body.trim() || null,
        date,
        imageUrl: imageUrl || null,
        imagePath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setSummary("");
      setBody("");
      setDateStr("");
      setFile(null);

      setMessage("投稿しました");
      await loadList();
    } catch (e) {
      console.error(e);
      setMessage("投稿に失敗しました");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">獲物ニュース投稿（管理）</h1>
        <p className="text-sm text-gray-600 mt-1">ログイン中：{user.email}</p>
      </header>

      <section className="rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-3">新規投稿</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            タイトル
            <input
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={posting}
            />
          </label>

          <label className="block text-sm">
            概要（一覧に出す短文）
            <input
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={posting}
            />
          </label>

          <label className="block text-sm">
            本文（任意）
            <textarea
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={posting}
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="block text-sm">
              捕獲日（任意）
              <input
                type="date"
                className="mt-1 rounded border border-gray-300 px-3 py-2"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                disabled={posting}
              />
            </label>

            <label className="block text-sm">
              写真（任意）
              <input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={posting}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="rounded bg-black px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {posting ? "投稿中..." : "投稿"}
          </button>

          {message && (
            <p className={`text-sm ${message.includes("失敗") ? "text-red-600" : "text-green-700"}`}>
              {message}
            </p>
          )}
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">最近の投稿</h2>
        {loading ? (
          <p className="text-sm text-gray-600">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600">まだ投稿がありません。</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
            <li key={it.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">
                    {it.date?.toDate?.() ? it.date.toDate().toLocaleDateString("ja-JP") : "日付なし"}
                  </div>
                  <div className="text-lg font-semibold">{it.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{it.summary}</div>

                  <button
                    type="button"
                    className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => handleDelete(it)}
                  >
                    削除
                  </button>
                </div>

                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="h-20 w-28 rounded border border-gray-200 object-cover"
                  />
                ) : null}
              </div>
            </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
