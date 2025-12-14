import * as admin from "firebase-admin";

type AdminTokenDoc = {
  token?: unknown;
};

export async function getAdminTokens(): Promise<string[]> {
  const snap = await admin.firestore().collection("adminTokens").get();

  // tokenフィールドを読む & 重複排除
  const tokens = Array.from(
    new Set(
      snap.docs
        .map((d) => (d.data() as AdminTokenDoc)?.token)
        .filter((t): t is string => typeof t === "string" && t.length > 0)
    )
  );

  return tokens;
}

/**
 * tokenフィールドが一致する adminTokens ドキュメントを削除
 * docIdがtokenじゃない構造でも確実に掃除できる
 */
export async function deleteAdminTokensByToken(tokens: string[]) {
  const uniq = Array.from(new Set(tokens)).filter((t) => t && t.length > 0);
  if (!uniq.length) return;

  const db = admin.firestore();

  // where(in) は最大10件制限があるので分割
  const chunkSize = 10;
  for (let i = 0; i < uniq.length; i += chunkSize) {
    const chunk = uniq.slice(i, i + chunkSize);

    const q = db.collection("adminTokens").where("token", "in", chunk);
    const snap = await q.get();
    if (snap.empty) continue;

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
