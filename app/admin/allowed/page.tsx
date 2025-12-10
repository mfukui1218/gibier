// app/admin/allowed/page.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";

export default function AllowedEmailPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ① 認証状態を読み込み中
  if (user === undefined) {
    return <main style={{ padding: 24 }}>読み込み中...</main>;
  }

  // ② 未ログインなら /login に飛ばして何も描画しない
  if (user === null) {
    router.replace("/login");
    return null;
  }

  // ③ ここまで来たら user は必ずオブジェクトなので email を読んでOK
  const adminEmail = "ttnetnzua@gmail.com";

  // 管理者以外はアクセス拒否
  if (user.email !== adminEmail) {
    return (
      <main style={{ padding: 24 }}>
        <h1>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  async function handleAdd() {
    if (!email) {
      setMessage("メールアドレスを入力してください");
      return;
    }

    const ok = window.confirm(`${email} を許可リストに追加しますか？`);
    if (!ok) return;

    try {
      await setDoc(doc(db, "allowedEmails", email.toLowerCase()), {
        createdAt: new Date(),
      });

      setMessage("追加しました！");
      setEmail("");

      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("登録に失敗しました");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>許可メールアドレスの追加（管理者）</h1>

      <p>ログイン中：{user.email}</p>

      <div style={{ marginTop: 20 }}>
        <input
          type="email"
          placeholder="許可するメールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={handleAdd}>追加</button>
      </div>

      {message && (
        <p style={{ marginTop: 12, color: message.includes("失敗") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </main>
  );
}
