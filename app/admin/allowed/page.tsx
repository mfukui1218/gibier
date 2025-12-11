// app/admin/allowed/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";

import {
  fetchUsers,
  type UserSummary,
} from "@/app/admin/lib/users";

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

const ADMIN_EMAIL = "ttnetnzua@gmail.com";

export default function AllowedEmailPage() {
  const user = useAuthUser();
  const router = useRouter();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [requests, setRequests] = useState<AllowRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // ===== 認証チェック =====
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // ===== データ取得 =====
  useEffect(() => {
    if (!user) return;

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

  // ===== 認証状態 =====
  if (user === undefined) {
    return <main className={styles.container}>読み込み中...</main>;
  }
  if (user === null) return null;
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className={styles.container}>
        <h1 className={styles.headerTitle}>アクセス拒否</h1>
        <p>このページは管理者のみ利用できます。</p>
      </main>
    );
  }

  // ===== 関係づけ =====
  const normalizedCurrentEmail = user.email?.toLowerCase() ?? "";

  const allowedEmailSet = new Set(
    allowedEmails.map((a) => a.email.toLowerCase())
  );

  const emailToUserMap = new Map<string, UserSummary>();
  users.forEach((u) => {
    if (u.email) emailToUserMap.set(u.email.toLowerCase(), u);
  });

  const allowedWithUser = allowedEmails.map((a) => ({
    ...a,
    user: emailToUserMap.get(a.email.toLowerCase()),
  }));

  const usersWithRelation = users.map((u) => {
    const isAllowed = u.email
      ? allowedEmailSet.has(u.email.toLowerCase())
      : false;
    const isCurrent =
      !!u.email && u.email.toLowerCase() === normalizedCurrentEmail;
    return { ...u, isAllowed, isCurrent };
  });

  const currentUserSummary = usersWithRelation.find((u) => u.isCurrent);
  const currentIsAllowed = allowedEmailSet.has(normalizedCurrentEmail);

  // ===== メールを手動で許可リストに追加 =====
  const handleAddAllowedEmail = async () => {
    setMessage("");

    const trimmed = newEmail.trim();
    if (!trimmed) {
      setMessage("メールアドレスを入力してください");
      clearMessageLater();
      return;
    }

    try {
      const added = await addAllowedEmail(trimmed);
      setAllowedEmails((prev) => {
        if (prev.some((p) => p.email === added.email)) return prev;
        return [...prev, added].sort((a, b) =>
          a.email.localeCompare(b.email)
        );
      });
      setNewEmail("");
      setMessage("許可メールに追加しました");
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("許可メールの追加に失敗しました");
      clearMessageLater();
    }
  };

  // ===== 申請メール：承認（＝ allowedEmails に追加 & 申請削除） =====
  const handleApproveRequest = async (req: AllowRequest) => {
    try {
      // 許可メールに追加
      const added = await addAllowedEmail(req.email);
      setAllowedEmails((prev) => {
        if (prev.some((p) => p.email === added.email)) return prev;
        return [...prev, added].sort((a, b) =>
          a.email.localeCompare(b.email)
        );
      });

      // 申請を削除
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

  // ===== 申請メール：却下（＝ 申請だけ削除） =====
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

  // ===== 許可メールから削除（＝「未許可」に戻す） =====
  const handleRemoveAllowedEmail = async (email: string) => {
    const ok = window.confirm(`${email} を許可リストから削除しますか？`);
    if (!ok) return;

    try {
      await removeAllowedEmail(email);
      setAllowedEmails((prev) =>
        prev.filter((a) => a.email !== email)
      );
      setMessage(`${email} を許可リストから削除しました`);
      clearMessageLater();
    } catch (e) {
      console.error(e);
      setMessage("許可メールの削除に失敗しました");
      clearMessageLater();
    }
  };

  // ===== JSX =====
  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        {/* ヘッダー */}
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>メール承認管理（管理者）</h1>
          <p className={styles.subtitle}>ログイン中：{user.email}</p>
        </header>

        {/* ログイン中ユーザーの状態 */}
        <section className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>メールアドレス：</span>
            <span>{user.email}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>users コレクション：</span>
            <span>
              {currentUserSummary
                ? `登録あり（名前: ${
                    currentUserSummary.name || "未設定"
                  } / ID: ${currentUserSummary.id}）`
                : "登録なし"}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>許可メールリスト：</span>
            <span>{currentIsAllowed ? "許可済みメール" : "未許可メール"}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>件数：</span>
            <span>
              申請 {requests.length} 件 / 許可メール {allowedEmails.length} 件 / ユーザー{" "}
              {users.length} 人
            </span>
          </div>
        </section>

        {/* 手動追加フォーム */}
        <section className={styles.manualAddSection}>
          <h2 className={styles.cardTitle}>メールを直接許可リストに追加</h2>
          <div className={styles.manualAddRow}>
            <input
              type="email"
              className={styles.input}
              placeholder="example@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={handleAddAllowedEmail}
            >
              追加
            </button>
          </div>
        </section>

        {/* 申請メール・許可メール・ユーザー一覧 */}
        <section className={styles.grid3}>
          {/* 申請メール一覧 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>申請メール一覧</h2>
              <span className={styles.cardCount}>{requests.length} 件</span>
            </div>

            {loading ? (
              <p>読み込み中...</p>
            ) : requests.length === 0 ? (
              <p>現在、申請はありません。</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>メールアドレス</th>
                      <th className={styles.th}>申請日時</th>
                      <th className={styles.th}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className={styles.td}>{r.email}</td>
                        <td className={styles.td}>
                          {r.createdAtText ?? "-"}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actionButtons}>
                            <button
                              type="button"
                              className={styles.buttonPrimary}
                              onClick={() => handleApproveRequest(r)}
                            >
                              許可
                            </button>
                            <p>
                            </p>
                            <button
                              type="button"
                              className={styles.buttonGhost}
                              onClick={() => handleRejectRequest(r)}
                            >
                              却下
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 許可メール一覧 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>許可メール一覧</h2>
              <span className={styles.cardCount}>
                {allowedEmails.length} 件
              </span>
            </div>

            {loading ? (
              <p>読み込み中...</p>
            ) : allowedWithUser.length === 0 ? (
              <p>まだ許可メールが登録されていません。</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>メールアドレス</th>
                      <th className={styles.th}>対応ユーザー</th>
                      <th className={styles.th}>作成日時</th>
                      <th className={styles.th}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allowedWithUser.map((a) => (
                      <tr key={a.email}>
                        <td className={styles.td}>{a.email}</td>
                        <td className={styles.td}>
                          {a.user
                            ? `${a.user.name || "(名前未設定)"}`
                            : "（users 未登録）"}
                        </td>
                        <td className={styles.td}>
                          {a.createdAtText ?? "-"}
                        </td>
                        <td className={styles.td}>
                          <button
                            type="button"
                            className={styles.buttonGhost}
                            onClick={() => handleRemoveAllowedEmail(a.email)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ユーザー一覧 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>ユーザー一覧</h2>
              <span className={styles.cardCount}>{users.length} 人</span>
            </div>

            {loading ? (
              <p>読み込み中...</p>
            ) : usersWithRelation.length === 0 ? (
              <p>まだユーザーが登録されていません。</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>名前</th>
                      <th className={styles.th}>メールアドレス</th>
                      <th className={styles.th}>作成日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithRelation.map((u) => (
                      <tr
                        key={u.id}
                        className={u.isCurrent ? styles.rowCurrent : undefined}
                      >
                        <td className={styles.td}>
                          {u.name || "(名前未設定)"}
                          {u.isCurrent && (
                            <span className={styles.currentTag}>（ログイン中）</span>
                          )}
                        </td>
                        <td className={styles.td}>{u.email}</td>
                        <td className={styles.td}>
                          {u.createdAtText ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {message && (
          <p
            className={
              message.includes("失敗") ? styles.messageErr : styles.messageOk
            }
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
