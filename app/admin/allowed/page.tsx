"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";

import { fetchUsers, type UserSummary } from "@/app/admin/lib/users";
import {
  fetchAllowedEmails,
  addAllowedEmail,
  removeAllowedEmail,
  type AllowedEmail,
} from "@/app/admin/lib/allowedEmails";
import {
  fetchAllowRequests,
  deleteAllowRequest,
  type AllowRequest,
} from "@/app/admin/lib/allowRequests";

import styles from "./allowed.module.css";

import SummaryCard from "./_components/SummaryCard";
import ManualAdd from "./_components/ManualAdd";
import RequestsTable from "./_components/RequestsTable";
import AllowedTable from "./_components/AllowedTable";
import UsersTable from "./_components/UsersTable";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function AllowedEmailPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [requests, setRequests] = useState<AllowRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Hooksより下で return しない（useMemo を必ず呼ぶため）
  const userEmail = (user?.email ?? "").toLowerCase().trim();
  const isAdmin = userEmail !== "" && userEmail === ADMIN_EMAIL.toLowerCase().trim();

  // ✅ useMemo は常に呼ばれる（userがnull/undefinedでもOKなように）
  const {
    allowedWithUser,
    usersWithRelation,
    currentUserSummary,
    currentIsAllowed,
  } = useMemo(() => {
    const allowedEmailSet = new Set(
      allowedEmails.map((a) => (a.email ?? "").toLowerCase())
    );

    const emailToUserMap = new Map<string, UserSummary>();
    for (const u of users) {
      if (u.email) emailToUserMap.set(u.email.toLowerCase(), u);
    }

    const allowedWithUser = allowedEmails.map((a) => ({
      ...a,
      user: emailToUserMap.get((a.email ?? "").toLowerCase()),
    }));

    const usersWithRelation = users.map((u) => {
      const uEmail = (u.email ?? "").toLowerCase();
      const isAllowed = !!uEmail && allowedEmailSet.has(uEmail);
      const isCurrent = !!uEmail && uEmail === userEmail;
      return { ...u, isAllowed, isCurrent };
    });

    const currentUserSummary = usersWithRelation.find((u) => u.isCurrent);
    const currentIsAllowed = userEmail !== "" && allowedEmailSet.has(userEmail);

    return {
      allowedWithUser,
      usersWithRelation,
      currentUserSummary,
      currentIsAllowed,
    };
  }, [allowedEmails, users, userEmail]);

  // ===== 認証チェック =====
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // ===== データ取得 =====
  useEffect(() => {
    if (!user) return; // undefined/nullは待つ

    const load = async () => {
      setLoading(true);
      try {
        const [userList, allowedList, requestList] = await Promise.all([
          fetchUsers(),
          fetchAllowedEmails(),
          fetchAllowRequests(),
        ]);
        setUsers(userList);
        setAllowedEmails(allowedList);
        setRequests(requestList);
      } catch (e) {
        console.error(e);
        setMessage("一覧の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const clearMessageLater = () => {
    if (typeof window === "undefined") return;
    window.setTimeout(() => setMessage(""), 3000);
  };

  // ===== handlers =====
  const handleAddAllowedEmail = async (email: string) => {
    setMessage("");
    const trimmed = email.trim();
    if (!trimmed) {
      setMessage("メールアドレスを入力してください");
      clearMessageLater();
      return;
    }

    try {
      const added = await addAllowedEmail(trimmed);
      setAllowedEmails((prev) => {
        if (prev.some((p) => p.email === added.email)) return prev;
        return [...prev, added].sort((a, b) => a.email.localeCompare(b.email));
      });
      setMessage("許可メールに追加しました");
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("許可メールの追加に失敗しました");
      clearMessageLater();
    }
  };

  const handleApproveRequest = async (req: AllowRequest) => {
    try {
      const added = await addAllowedEmail(req.email);
      setAllowedEmails((prev) => {
        if (prev.some((p) => p.email === added.email)) return prev;
        return [...prev, added].sort((a, b) => a.email.localeCompare(b.email));
      });

      await deleteAllowRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));

      setMessage(`${req.email} を許可しました`);
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("申請メールの承認に失敗しました");
      clearMessageLater();
    }
  };

  const handleRejectRequest = async (req: AllowRequest) => {
    try {
      await deleteAllowRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));

      setMessage(`${req.email} の申請を却下しました`);
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("申請メールの削除に失敗しました");
      clearMessageLater();
    }
  };

  const handleRemoveAllowedEmail = async (email: string) => {
    const ok = window.confirm(`${email} を許可リストから削除しますか？`);
    if (!ok) return;

    try {
      await removeAllowedEmail(email);
      setAllowedEmails((prev) => prev.filter((a) => a.email !== email));
      setMessage(`${email} を許可リストから削除しました`);
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("許可メールの削除に失敗しました");
      clearMessageLater();
    }
  };

  // ===== 認証状態 =====
  if (user === undefined) {
    return <main className={styles.container}>読み込み中...</main>;
  }
  if (user === null) return null;

  if (!isAdmin) {
    return (
      <main className={styles.container}>
        <h1 className={styles.headerTitle}>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  // ===== JSX =====
  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>メール承認管理（管理者）</h1>
          <p className={styles.subtitle}>ログイン中：{user.email}</p>
        </header>

        <SummaryCard
          styles={styles}
          userEmail={user.email ?? ""}
          currentUserSummary={currentUserSummary}
          currentIsAllowed={currentIsAllowed}
          counts={{
            requests: requests.length,
            allowed: allowedEmails.length,
            users: users.length,
          }}
        />

        <ManualAdd styles={styles} onAdd={handleAddAllowedEmail} />

        <section className={styles.grid3}>
          <RequestsTable
            styles={styles}
            loading={loading}
            requests={requests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />

          <AllowedTable
            styles={styles}
            loading={loading}
            allowedWithUser={allowedWithUser}
            onRemove={handleRemoveAllowedEmail}
          />

          <UsersTable styles={styles} loading={loading} users={usersWithRelation} />
        </section>

        {message && (
          <p className={message.includes("失敗") ? styles.messageErr : styles.messageOk}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
