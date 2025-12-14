// app/admin/notifications/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "")
  .toLowerCase()
  .trim();

type ReqItem = {
  id: string;
  createdAt?: any;
  email?: string;
  userEmail?: string;
  partId?: string;
  partName?: string;
  amount?: string;
  message?: string;
  status?: string; // もしあるなら
};

type ContactItem = {
  id: string;
  createdAt?: any;
  name?: string;
  email?: string;
  message?: string;
};

type AllowReqItem = {
  id: string;
  createdAt?: any;
  email: string;
};

function formatTime(ts: any) {
  try {
    const d = ts?.toDate?.();
    if (!d) return "";
    return d.toLocaleString("ja-JP");
  } catch {
    return "";
  }
}

export default function AdminNotificationsPage() {
  const user = useAuthUser();
  const router = useRouter();

  const isAdmin = useMemo(() => {
    const email = (user?.email ?? "").toLowerCase().trim();
    return email !== "" && email === ADMIN_EMAIL;
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [requests, setRequests] = useState<ReqItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [allowRequests, setAllowRequests] = useState<AllowReqItem[]>([]);

  // 未ログインなら /login
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  async function load() {
    if (!isAdmin) return;

    setLoading(true);
    setErr("");

    try {
      const qReq = query(
        collection(db, "requests"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const qCon = query(
        collection(db, "contacts"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const qAllow = query(
        collection(db, "allowRequests"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const [sReq, sCon, sAllow] = await Promise.all([
        getDocs(qReq),
        getDocs(qCon),
        getDocs(qAllow),
      ]);

      setRequests(sReq.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setContacts(sCon.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setAllowRequests(
        sAllow.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "読み込みに失敗しました");
      setRequests([]);
      setContacts([]);
      setAllowRequests([]);
    } finally {
      setLoading(false);
    }
  }

  // adminになったら読む
  useEffect(() => {
    if (!isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (user === undefined) return <main className="p-6">読み込み中...</main>;
  if (user === null) return null;

  if (!isAdmin) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">アクセス拒否</h1>
        <p>このページは管理者のみです。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">統合管理</h1>
          <p className="text-sm text-white mt-1">ログイン中：{user.email}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded bg-black px-3 py-2 text-sm font-semibold text-white"
          >
            再読み込み
          </button>
        </div>
      </header>

      {err ? <p className="text-sm text-red-300">{err}</p> : null}

      {loading ? (
        <div className="text-sm text-gray-200">読み込み中...</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {/* requests */}
          <div className="rounded-xl border border-white/20 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">部位リクエスト（requests）</h2>
              <span className="text-xs text-white/80">{requests.length} 件</span>
            </div>

            {requests.length === 0 ? (
              <p className="text-sm text-white/80 mt-3">まだありません。</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {requests.slice(0, 10).map((r) => (
                  <li key={r.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                    <div className="text-sm font-semibold">
                      {(r.userEmail ?? r.email ?? "unknown")}
                    </div>
                    <div className="text-sm text-white/90 mt-1">
                      {r.partName ?? r.partId ?? "-"} / {r.amount ?? "-"}
                    </div>
                    {r.message ? (
                      <div className="text-xs text-white/80 mt-1 whitespace-pre-wrap">
                        {String(r.message).slice(0, 80)}
                        {String(r.message).length > 80 ? "…" : ""}
                      </div>
                    ) : null}
                    <div className="text-xs text-white/70 mt-2">
                      {formatTime(r.createdAt)}
                      {r.status ? ` / status: ${r.status}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="mt-3 text-xs underline text-white/90"
              onClick={() => router.push("/admin/requestlist")}
            >
              もっと見る →
            </button>
          </div>

          {/* contacts */}
          <div className="rounded-xl border border-white/20 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">問い合わせ（contacts）</h2>
              <span className="text-xs text-white/80">{contacts.length} 件</span>
            </div>

            {contacts.length === 0 ? (
              <p className="text-sm text-white/80 mt-3">まだありません。</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {contacts.slice(0, 10).map((c) => (
                  <li key={c.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                    <div className="text-sm font-semibold">
                      {c.name ?? "（名前なし）"}
                      {c.email ? <span className="text-xs text-white/70"> / {c.email}</span> : null}
                    </div>
                    <div className="text-xs text-white/80 mt-1 whitespace-pre-wrap">
                      {String(c.message ?? "").slice(0, 90)}
                      {String(c.message ?? "").length > 90 ? "…" : ""}
                    </div>
                    <div className="text-xs text-white/70 mt-2">
                      {formatTime(c.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="mt-3 text-xs underline text-white/90"
              onClick={() => router.push("/admin/contacts")}
            >
              もっと見る →
            </button>
          </div>

          {/* allowRequests */}
          <div className="rounded-xl border border-white/20 bg-black/20 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">許可申請（allowRequests）</h2>
              <span className="text-xs text-white/80">{allowRequests.length} 件</span>
            </div>

            {allowRequests.length === 0 ? (
              <p className="text-sm text-white/80 mt-3">申請はありません。</p>
            ) : (
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {allowRequests.slice(0, 12).map((a) => (
                  <li key={a.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                    <div className="text-sm font-semibold">{a.email}</div>
                    <div className="text-xs text-white/70 mt-2">
                      {formatTime(a.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="mt-3 text-xs underline text-white/90"
              onClick={() => router.push("/admin/allowed")}
            >
              許可管理へ →
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
