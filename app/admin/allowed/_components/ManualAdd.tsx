"use client";

import { useState } from "react";

type Props = {
  styles: Record<string, string>;
  onAdd: (email: string) => Promise<void>;
};

export default function ManualAdd({ styles, onAdd }: Props) {
  const [newEmail, setNewEmail] = useState("");

  return (
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
          onClick={async () => {
            await onAdd(newEmail);
            setNewEmail("");
          }}
        >
          追加
        </button>
      </div>
    </section>
  );
}
