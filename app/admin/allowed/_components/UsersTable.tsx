type UserRow = {
  id: string;
  name?: string;
  email?: string;
  createdAtText?: string;
  isCurrent?: boolean;
};

type Props = {
  styles: Record<string, string>;
  loading: boolean;
  users: UserRow[];
};

export default function UsersTable({ styles, loading, users }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>ユーザー一覧</h2>
        <span className={styles.cardCount}>{users.length} 人</span>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : users.length === 0 ? (
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
              {users.map((u) => (
                <tr key={u.id} className={u.isCurrent ? styles.rowCurrent : undefined}>
                  <td className={styles.td}>
                    {u.name || "(名前未設定)"}
                    {u.isCurrent && (
                      <span className={styles.currentTag}>（ログイン中）</span>
                    )}
                  </td>
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>{u.createdAtText ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
