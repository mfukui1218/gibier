type Props = {
  styles: Record<string, string>;
  userEmail: string;
  currentUserSummary:
    | { name?: string; id: string }
    | undefined;
  currentIsAllowed: boolean;
  counts: { requests: number; allowed: number; users: number };
};

export default function SummaryCard({
  styles,
  userEmail,
  currentUserSummary,
  currentIsAllowed,
  counts,
}: Props) {
  return (
    <section className={styles.summaryCard}>
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>メールアドレス：</span>
        <span>{userEmail}</span>
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>users コレクション：</span>
        <span>
          {currentUserSummary
            ? `登録あり（名前: ${currentUserSummary.name || "未設定"} / ID: ${
                currentUserSummary.id
              }）`
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
          申請 {counts.requests} 件 / 許可メール {counts.allowed} 件 / ユーザー{" "}
          {counts.users} 人
        </span>
      </div>
    </section>
  );
}
