type AllowedWithUser = {
  email: string;
  createdAtText?: string;
  user?: { name?: string };
};

type Props = {
  styles: Record<string, string>;
  loading: boolean;
  allowedWithUser: AllowedWithUser[];
  onRemove: (email: string) => void;
};

export default function AllowedTable({
  styles,
  loading,
  allowedWithUser,
  onRemove,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>許可メール一覧</h2>
        <span className={styles.cardCount}>{allowedWithUser.length} 件</span>
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
                    {a.user ? `${a.user.name || "(名前未設定)"}` : "（users 未登録）"}
                  </td>
                  <td className={styles.td}>{a.createdAtText ?? "-"}</td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={() => onRemove(a.email)}
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
  );
}
