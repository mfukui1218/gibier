import * as admin from "firebase-admin";

/**
 * 同じkeyを1回だけ通すゲート
 * @returns true: 初回なので続行 / false: 重複なのでスキップ
 */
export async function shouldProcessOnce(key: string) {
  const db = admin.firestore();
  const ref = db.doc(`_dedupe/${key}`);

  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    Date.now() + 1000 * 60 * 60 // 1時間（好きに調整）
  );

  try {
    await ref.create({
      createdAt: now,   // serverTimestampでもOK
      expiresAt,        // ★ TTL用：成功時に必ず入れる
    });
    return true;
  } catch (e: any) {
    const code = String(e?.code ?? "");
    if (code.includes("already-exists") || code.includes("ALREADY_EXISTS")) {
      return false;
    }
    throw e;
  }
}
