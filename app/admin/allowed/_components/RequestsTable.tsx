type Props = {
  styles: Record<string, string>;
  loading: boolean;
  requests: { id: string; email: string; createdAtText?: string }[];
  onApprove: (req: any) => void;
  onReject: (req: any) => void;
};

export default function RequestsTable({
  styles,
  loading,
  requests,
  onApprove,
  onReject,
}: Props) {
  return (
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
                  <td className={styles.td}>{r.createdAtText ?? "-"}</td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.buttonPrimary}
                        onClick={() => onApprove(r)}
                      >
                        許可
                      </button>
                      <button
                        type="button"
                        className={styles.buttonGhost}
                        onClick={() => onReject(r)}
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
  );
}
