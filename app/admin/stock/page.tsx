// app/admin/stock/page.tsx
"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

type Part = {
  id: string;
  name: string;
  animal: string;
  description: string;
  price: string;   // 入力用（文字列）
  stock: string;   // 入力用（文字列）
  imageUrl: string;
};

export default function AdminStockPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 新規追加フォーム用
  const [newPart, setNewPart] = useState<Part>({
    id: "",
    name: "",
    animal: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  // 未ログインなら /login に飛ばす
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // Firestore から部位一覧をロード（DB マスタ）
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const colRef = collection(db, "parts");
        const snap = await getDocs(colRef);

        const nextParts: Part[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? "",
            animal: data.animal ?? "",
            description: data.description ?? "",
            price:
              data.price === undefined || data.price === null
                ? ""
                : String(data.price),
            stock:
              data.stock === undefined || data.stock === null
                ? ""
                : String(data.stock),
            imageUrl: data.imageUrl ?? "",
          };
        });

        // 動物種＋名前でソートしておく
        nextParts.sort((a, b) =>
          `${a.animal}${a.name}`.localeCompare(
            `${b.animal}${b.name}`,
            "ja"
          )
        );

        setParts(nextParts);
      } catch (e) {
        console.error(e);
        setMessage("在庫情報の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const clearMessageLater = () => {
    setTimeout(() => setMessage(""), 3000);
  };

  // 既存部位のフィールド変更
  const handlePartFieldChange =
    (id: string, field: keyof Part) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.value;
      setParts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, [field]: value } : p
        )
      );
    };

  // 新規部位フォームの入力変更
  const handleNewPartFieldChange =
    (field: keyof Part) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.value;
      setNewPart((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  // 既存部位を保存（成功したら「保存しました」）
  const handleSaveExisting = async (part: Part) => {
    setMessage("");

    try {
      await setDoc(
        doc(db, "parts", part.id),
        {
          name: part.name || null,
          animal: part.animal || null,
          description: part.description || null,
          price: part.price ? Number(part.price) : null,
          stock: part.stock ? Number(part.stock) : null,
          imageUrl: part.imageUrl || null,
        },
        { merge: true }
      );

      setMessage("保存しました");
      clearMessageLater();
    } catch (error) {
      console.error(error);
      setMessage("保存に失敗しました");
      clearMessageLater();
    }
  };

  // 部位を削除
  const handleDeletePart = async (part: Part) => {
    const ok = window.confirm(
      `「${part.name || part.id}」を削除しますか？\nこの操作は元に戻せません。`
    );
    if (!ok) return;

    setMessage("");

    try {
      await deleteDoc(doc(db, "parts", part.id));

      // state からも削除
      setParts((prev) => prev.filter((p) => p.id !== part.id));

      setMessage("削除しました");
      clearMessageLater();
    } catch (error) {
      console.error(error);
      setMessage("削除に失敗しました");
      clearMessageLater();
    }
  };

  // 新しい部位を追加
  const handleAddNewPart = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const trimmedId = newPart.id.trim();
    const trimmedName = newPart.name.trim();

    if (!trimmedId || !trimmedName) {
      setMessage("部位IDと部位名は必須です");
      clearMessageLater();
      return;
    }

    // ID 重複チェック
    if (parts.some((p) => p.id === trimmedId)) {
      setMessage("同じIDの部位が既に存在します");
      clearMessageLater();
      return;
    }

    const partToSave: Part = {
      ...newPart,
      id: trimmedId,
      name: trimmedName,
    };

    try {
      await setDoc(doc(db, "parts", trimmedId), {
        name: partToSave.name || null,
        animal: partToSave.animal || null,
        description: partToSave.description || null,
        price: partToSave.price
          ? Number(partToSave.price)
          : null,
        stock: partToSave.stock
          ? Number(partToSave.stock)
          : null,
        imageUrl: partToSave.imageUrl || null,
      });

      // state に追加（→ 即画面に出る）
      setParts((prev) => [...prev, partToSave]);

      // フォームをクリア
      setNewPart({
        id: "",
        name: "",
        animal: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });

      setMessage("保存しました");
      clearMessageLater();
    } catch (error) {
      console.error(error);
      setMessage("新しい部位の追加に失敗しました");
      clearMessageLater();
    }
  };

  // ローディング
  if (user === undefined || loading) {
    return <main className="p-6">読み込み中...</main>;
  }

  // 非ログイン（リダイレクト済みなので何も描画しない）
  if (user === null) {
    return null;
  }

  // 管理者チェック
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-xl font-bold">アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">在庫管理（管理者）</h1>
        <p className="mt-2 text-sm text-gray-600">
          ログイン中：{user.email}
        </p>
      </header>

      {/* 新しい部位を追加（DB に直接追加） */}
      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">新しい部位を追加</h2>
        <p className="mt-1 text-xs text-gray-500">
          部位IDは英数字で一意なもの
          （例: &quot;venison_shoulder&quot;）にしてください。
        </p>

        <form
          className="mt-4 space-y-3 text-sm"
          onSubmit={handleAddNewPart}
        >
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span>部位ID（ドキュメントID）</span>
              <input
                type="text"
                className="w-56 rounded border border-gray-300 px-2 py-1"
                value={newPart.id}
                onChange={handleNewPartFieldChange("id")}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>部位名</span>
              <input
                type="text"
                className="w-48 rounded border border-gray-300 px-2 py-1"
                value={newPart.name}
                onChange={handleNewPartFieldChange("name")}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>動物種（例: シカ / イノシシ）</span>
              <input
                type="text"
                className="w-48 rounded border border-gray-300 px-2 py-1"
                value={newPart.animal}
                onChange={handleNewPartFieldChange("animal")}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span>説明</span>
            <textarea
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
              rows={2}
              value={newPart.description}
              onChange={handleNewPartFieldChange("description")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>画像URL / パス</span>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-2 py-1"
              value={newPart.imageUrl}
              onChange={handleNewPartFieldChange("imageUrl")}
              placeholder="https://... もしくは storage のパスなど"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span>初期価格（円/100g）</span>
              <input
                type="number"
                className="w-32 rounded border border-gray-300 px-2 py-1"
                value={newPart.price}
                onChange={handleNewPartFieldChange("price")}
              />
            </label>

            <label className="flex items-center gap-2">
              <span>初期在庫量（g）</span>
              <input
                type="number"
                className="w-32 rounded border border-gray-300 px-2 py-1"
                value={newPart.stock}
                onChange={handleNewPartFieldChange("stock")}
              />
            </label>

            <button
              type="submit"
              className="rounded bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800"
            >
              部位を追加
            </button>
          </div>
        </form>
      </section>

      {/* DB から取ってきた部位一覧 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">部位一覧（DB）</h2>

        {parts.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ部位が登録されていません。
          </p>
        )}

        {parts.map((part) => (
          <article
            key={part.id}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2 text-sm">
                  <label className="flex flex-col gap-1">
                    <span>部位名</span>
                    <input
                      type="text"
                      className="w-40 rounded border border-gray-300 px-2 py-1"
                      value={part.name}
                      onChange={handlePartFieldChange(
                        part.id,
                        "name"
                      )}
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span>動物種</span>
                    <input
                      type="text"
                      className="w-32 rounded border border-gray-300 px-2 py-1"
                      value={part.animal}
                      onChange={handlePartFieldChange(
                        part.id,
                        "animal"
                      )}
                    />
                  </label>
                </div>
                <span className="text-xs text-gray-400">
                  ID: {part.id}
                </span>
              </div>
            </div>

            <label className="mt-3 flex flex-col gap-1 text-sm">
              <span>説明</span>
              <textarea
                className="w-full rounded border border-gray-300 px-2 py-1"
                rows={2}
                value={part.description}
                onChange={handlePartFieldChange(
                  part.id,
                  "description"
                )}
              />
            </label>

            <label className="mt-2 flex flex-col gap-1 text-sm">
              <span>画像URL / パス</span>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-2 py-1"
                value={part.imageUrl}
                onChange={handlePartFieldChange(
                  part.id,
                  "imageUrl"
                )}
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span>価格（円/100g）</span>
                <input
                  type="number"
                  className="w-32 rounded border border-gray-300 px-2 py-1"
                  value={part.price}
                  onChange={handlePartFieldChange(
                    part.id,
                    "price"
                  )}
                />
              </label>

              <label className="flex items-center gap-2">
                <span>在庫量（g）</span>
                <input
                  type="number"
                  className="w-32 rounded border border-gray-300 px-2 py-1"
                  value={part.stock}
                  onChange={handlePartFieldChange(
                    part.id,
                    "stock"
                  )}
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveExisting(part)}
                  className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
                >
                  保存
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePart(part)}
                  className="rounded bg-red-600 px-4 py-1.5 font-semibold text-white hover:bg-red-700 active:bg-red-800"
                >
                  削除
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.includes("失敗")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
