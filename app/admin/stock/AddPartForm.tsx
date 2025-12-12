// app/admin/stock/AddPartForm.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import type { NewPartInput } from "./useParts";

type Props = {
  onAdd: (input: NewPartInput) => Promise<void>;
};

export default function AddPartForm({ onAdd }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [animal, setAnimal] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        id,
        name,
        animal,
        description,
        price,
        stock,
        imageFile,
      });

      // 成功したときだけフォームリセット
      setId("");
      setName("");
      setAnimal("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageFile(null);
    } catch {
      // メッセージは useParts 側で出しているのでここでは何もしない
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">新しい部位を追加</h2>
      <p className="mt-1 text-xs text-gray-500">
        部位IDは英数字で一意なもの
        （例: &quot;venison_shoulder&quot;）にしてください。
      </p>

      <form
        className="mt-4 space-y-3 text-sm"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1">
            <span>部位ID（ドキュメントID）</span>
            <input
              type="text"
              className="w-56 rounded border border-gray-300 px-2 py-1"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>部位名</span>
            <input
              type="text"
              className="w-48 rounded border border-gray-300 px-2 py-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>動物種（例: シカ / イノシシ）</span>
            <input
              type="text"
              className="w-48 rounded border border-gray-300 px-2 py-1"
              value={animal}
              onChange={(e) => setAnimal(e.target.value)}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span>説明</span>
          <textarea
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span>初期価格（円/100g）</span>
            <input
              type="number"
              className="w-32 rounded border border-gray-300 px-2 py-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2">
            <span>初期在庫量（g）</span>
            <input
              type="number"
              className="w-32 rounded border border-gray-300 px-2 py-1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>
        </div>

        <label className="mt-2 flex flex-col gap-1">
          <span>画像ファイル（任意）</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs"
          />
          {imageFile && (
            <span className="text-xs text-gray-500">
              選択中: {imageFile.name}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60"
        >
          {submitting ? "追加中..." : "部位を追加"}
        </button>
      </form>
    </section>
  );
}
