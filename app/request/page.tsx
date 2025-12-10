// app/request/page.tsx
"use client";

import { useState, type CSSProperties, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MEAT_PARTS } from "@/lib/meatParts";

// 共通ボタンスタイル（他画面と統一）
const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  width: "100%",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  color: "#fff",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  transition: "all 0.25s",
  marginTop: 14,
};

// 共通入力スタイル
const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#ffffff",
  color: "#000000",
  fontSize: 16,
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
};

// ---------------------------
// useSearchParams を使う本体
// ---------------------------
function RequestPageInner() {
  const user = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL から partId を読む（なければ先頭の部位）
  const initialPartId = searchParams.get("partId") ?? MEAT_PARTS[0]?.id ?? "";

  const [partId, setPartId] = useState(initialPartId);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (user === undefined) {
    return (
      <main style={{ padding: 24, textAlign: "center", color: "#fff" }}>
        読み込み中...
      </main>
    );
  }

  if (user === null) {
    router.replace("/login");
    return null;
  }

  const part = MEAT_PARTS.find((p) => p.id === partId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!partId) {
      setMessage("部位を選択してください");
      return;
    }

    if (!amount) {
      setMessage("希望量（g）を入力してください");
      return;
    }

    if (!address.trim()) {
      setMessage("送り先を入力してください");
      return;
    }

    const ok = window.confirm(
      `${part?.name ?? partId} を ${amount}g、以下の住所に希望として送信します。\n\n${address}\n\nよろしいですか？`
    );
    if (!ok) return;

    setSending(true);

    try {
      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: user.email ?? null,
        partId,
        amount,
        address,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setMessage("リクエストを送信しました！");
      setAmount("");
      setAddress("");

      setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      console.error(e);
      setMessage("送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      style={{
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(0,0,0,0.35)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          ジビエ希望リクエスト
        </h1>

        <p
          style={{
            fontSize: 13,
            textAlign: "center",
            marginBottom: 16,
            color: "#ddd",
          }}
        >
          ログイン中：{user.email}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* 部位選択 */}
          <label style={{ color: "#fff", fontSize: 14 }}>
            希望する部位
            <select
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: 8,
                cursor: "pointer",
              }}
            >
              {MEAT_PARTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.animal ? `${p.animal}：${p.name}` : p.name}
                </option>
              ))}
            </select>
          </label>

          {/* 希望量 */}
          <label style={{ color: "#fff", fontSize: 14 }}>
            希望量
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginTop: 4,
              }}
            >
              <input
                type="number"
                placeholder="希望量"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  ...inputStyle,
                  width: 160,
                  paddingRight: 28,
                  marginTop: 0,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                g
              </span>
            </div>
          </label>

          {/* 送り先 */}
          <label style={{ color: "#fff", fontSize: 14 }}>
            送り先
            <textarea
              placeholder={`郵便番号・都道府県・市区町村・番地など送ってほしい場所。
LINEで住所教えてくれても可（"LINE" と送ればOK）`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                marginTop: 4,
                padding: "12px",
                whiteSpace: "pre-line",
                resize: "vertical",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            style={{
              ...buttonStyle,
              opacity: sending ? 0.7 : 1,
              cursor: sending ? "default" : "pointer",
            }}
            onMouseOver={(e) => {
              if (sending) return;
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {sending ? "送信中..." : "リクエストを送信"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: 16,
              color: message.includes("失敗") ? "#ff8080" : "#b4ffb4",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

// ---------------------------
// ページ本体（Suspense でラップ）
// ---------------------------
export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 24, textAlign: "center", color: "#fff" }}>
          読み込み中...
        </main>
      }
    >
      <RequestPageInner />
    </Suspense>
  );
}
