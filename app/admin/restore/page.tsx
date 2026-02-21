"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const USERS_TO_RESTORE = [
  "keitarogoya@gmail.com",
  "request@gmail.com",
  "outa.w0228@gmail.com",
  "akemi.f07@gmail.com",
  "ttnetnzua@gmail.com",
  "ttneztnzua@i.softbank.jp"
];

export default function RestorePage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function restoreAllowedEmails() {
    setLoading(true);
    setStatus("Restoring allowedEmails...");

    try {
      for (const email of USERS_TO_RESTORE) {
        const normalizedEmail = email.toLowerCase().trim();
        await setDoc(doc(db, "allowedEmails", normalizedEmail), {
          email: normalizedEmail,
          restoredAt: serverTimestamp(),
          restoredFrom: "manual-restore"
        });
        setStatus(`Restored: ${normalizedEmail}`);
      }

      setStatus("✅ All allowedEmails restored successfully!");
    } catch (error) {
      console.error(error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function createSampleParts() {
    setLoading(true);
    setStatus("Creating sample parts...");

    const sampleParts = [
      {
        id: "shoulder",
        name: "肩ロース",
        animal: "イノシシ",
        description: "脂身が適度にあり、柔らかくジューシーな部位",
        price: 2000,
        stock: 0,
        unit: "g",
        imageUrl: "" // Firebase Storage のURLを手動で設定してください
      },
      {
        id: "loin",
        name: "ロース",
        animal: "イノシシ",
        description: "最高級部位。きめ細かく柔らかい",
        price: 2500,
        stock: 0,
        unit: "g",
        imageUrl: ""
      },
      {
        id: "belly",
        name: "バラ",
        animal: "イノシシ",
        description: "脂と赤身のバランスが良い",
        price: 1800,
        stock: 0,
        unit: "g",
        imageUrl: ""
      },
      {
        id: "leg",
        name: "モモ",
        animal: "イノシシ",
        description: "赤身が多く、ヘルシーな部位",
        price: 1500,
        stock: 0,
        unit: "g",
        imageUrl: ""
      },
    ];

    try {
      for (const part of sampleParts) {
        await setDoc(doc(db, "parts", part.id), {
          ...part,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setStatus(`Created: ${part.name}`);
      }

      setStatus("✅ Sample parts created successfully!");
    } catch (error) {
      console.error(error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        データ復元ページ
      </h1>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          1. allowedEmails の復元
        </h2>
        <p style={{ marginBottom: 12, color: "#666" }}>
          Firebase Authenticationに登録されているユーザーのメールアドレスを
          allowedEmailsコレクションに復元します。
        </p>
        <button
          onClick={restoreAllowedEmails}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1
          }}
        >
          allowedEmails を復元
        </button>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          2. サンプル部位データの作成
        </h2>
        <p style={{ marginBottom: 12, color: "#666" }}>
          基本的な部位データ（肩ロース、ロース、バラ、モモ）を作成します。
        </p>
        <button
          onClick={createSampleParts}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1
          }}
        >
          サンプル部位データを作成
        </button>
      </div>

      {status && (
        <div
          style={{
            padding: 16,
            backgroundColor: status.includes("❌") ? "#fee" : "#efe",
            borderRadius: 6,
            marginTop: 24
          }}
        >
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{status}</pre>
        </div>
      )}

      <div style={{ marginTop: 32, padding: 16, backgroundColor: "#fef3c7", borderRadius: 6 }}>
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          ⚠️ 注意事項
        </h3>
        <ul style={{ marginLeft: 20, color: "#92400e" }}>
          <li>この操作は管理者のみが実行できます</li>
          <li>既存のデータがある場合は上書きされます</li>
          <li>復元後は /admin/allowed で確認してください</li>
        </ul>
      </div>
    </main>
  );
}
