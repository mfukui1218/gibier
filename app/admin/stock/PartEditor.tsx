// app/admin/stock/PartEditor.tsx
"use client";

import { useState, type ChangeEvent } from "react";
import type { Part } from "./useParts";

type Props = {
  part: Part;
  onFieldChange: (id: string, field: keyof Part, value: string) => void;
  onSave: (part: Part) => Promise<void>;
  onDelete: (part: Part) => Promise<void>;
  onUploadImage: (id: string, file: File) => Promise<string>;
};

export default function PartEditor({
  part,
  onFieldChange,
  onSave,
  onDelete,
  onUploadImage,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await onUploadImage(part.id, file);
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleSaveClick = async () => {
    await onSave(part);
  };

  const handleDeleteClick = async () => {
    const ok = window.confirm(
      `「${part.name || part.id}」を削除しますか？\nこの操作は元に戻せません。`
    );
    if (!ok) return;

    await onDelete(part); // ✅ ここだけ
  };

  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span>部位名</span>
              <input
                type="text"
                className="w-40 rounded border border-gray-300 px-2 py-1"
                value={part.name}
                onChange={(e) => onFieldChange(part.id, "name", e.target.value)}
                disabled={uploading}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>動物種</span>
              <input
                type="text"
                className="w-32 rounded border border-gray-300 px-2 py-1"
                value={part.animal}
                onChange={(e) => onFieldChange(part.id, "animal", e.target.value)}
                disabled={uploading}
              />
            </label>
          </div>

          <span className="text-xs text-gray-400">ID: {part.id}</span>
        </div>

        <div className="h-24 w-36 overflow-hidden rounded border border-gray-200 bg-gray-50">
          {part.imageUrl ? (
            <img
              src={part.imageUrl}
              alt={part.name || part.id}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>
      </div>

      <label className="mt-3 flex flex-col gap-1 text-sm">
        <span>説明</span>
        <textarea
          className="w-full rounded border border-gray-300 px-2 py-1"
          rows={2}
          value={part.description}
          onChange={(e) => onFieldChange(part.id, "description", e.target.value)}
          disabled={uploading}
        />
      </label>

      <label className="mt-2 flex flex-col gap-1 text-sm">
        <span>画像URL（直接設定）</span>
        <input
          type="text"
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          placeholder="https://firebasestorage.googleapis.com/..."
          value={part.imageUrl}
          onChange={(e) => onFieldChange(part.id, "imageUrl", e.target.value)}
          disabled={uploading}
        />
      </label>

      <label className="mt-2 flex flex-col gap-1 text-sm">
        <span>
          または画像ファイルをアップロード
          {uploading && <span className="ml-2 text-xs text-gray-500">アップロード中...</span>}
        </span>
        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span>価格（円/100g）</span>
          <input
            type="number"
            className="w-32 rounded border border-gray-300 px-2 py-1"
            value={part.price}
            onChange={(e) => onFieldChange(part.id, "price", e.target.value)}
            disabled={uploading}
          />
        </label>

        <label className="flex items-center gap-2">
          <span>在庫量（g）</span>
          <input
            type="number"
            className="w-32 rounded border border-gray-300 px-2 py-1"
            value={part.stock}
            onChange={(e) => onFieldChange(part.id, "stock", e.target.value)}
            disabled={uploading}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={uploading}
            className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white disabled:opacity-50"
          >
            保存
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={uploading}
            className="rounded bg-red-600 px-4 py-1.5 font-semibold text-white disabled:opacity-50"
          >
            削除
          </button>
        </div>
      </div>
    </article>
  );
}
