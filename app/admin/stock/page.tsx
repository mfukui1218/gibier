// app/admin/stock/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useParts } from "./useParts";
import AddPartForm from "./AddPartForm";
import PartEditor from "./PartEditor";

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function AdminStockPage() {
  const user = useAuthUser();
  const router = useRouter();
  const {
    parts,
    loading,
    message,
    updatePartField,
    savePart,
    deletePart,
    uploadPartImage,
    addPart,
  } = useParts();

  // ローディング
  if (user === undefined || loading) {
    return <main className="p-6">読み込み中...</main>;
  }

  // 未ログイン → /login へ（表示はしない）
  if (user === null) {
    router.replace("/login");
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

      {/* 新しい部位を追加 */}
      <AddPartForm onAdd={addPart} />

      {/* 部位一覧 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">部位一覧（DB）</h2>

        {parts.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ部位が登録されていません。
          </p>
        ) : (
          parts.map((part) => (
            <PartEditor
              key={part.id}
              part={part}
              onFieldChange={updatePartField}
              onSave={savePart}
              onDelete={(p) => deletePart(p.id)}
              onUploadImage={uploadPartImage}
            />
          ))
        )}
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
