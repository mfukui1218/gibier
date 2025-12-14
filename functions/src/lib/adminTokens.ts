import * as admin from "firebase-admin";

type AdminTokenDoc = {
  token?: unknown;
};

export async function getAdminTokens(): Promise<string[]> {
  const snap = await admin.firestore().collection("adminTokens").get();

  const tokens = Array.from(
    new Set(
      snap.docs
        .map((d) => {
          const data = d.data() as AdminTokenDoc;

          // ① tokenフィールドがあればそれを使う
          if (typeof data?.token === "string" && data.token.length > 0) {
            return data.token;
          }

          // ② 無ければ docId を token として扱う（docId=token運用）
          if (typeof d.id === "string" && d.id.length > 0) {
            return d.id;
          }

          return "";
        })
        .filter((t): t is string => typeof t === "string" && t.length > 0)
    )
  );

  return tokens;
}

/**
 * 無効トークン掃除：tokenフィールド一致 も docId一致 も両方消す
 */
export async function deleteAdminTokensByToken(tokens: string[]) {
  const uniq = Array.from(new Set(tokens)).filter((t) => t && t.length > 0);
  if (!uniq.length) return;

  const db = admin.firestore();

  // ① docId=token の可能性：まず doc 直指定で消す（存在すれば消える）
  {
    const batch = db.batch();
    uniq.forEach((t) => batch.delete(db.collection("adminTokens").doc(t)));
    await batch.commit();
  }

  // ② tokenフィールド運用の可能性：where token in で消す（最大10件なので分割）
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
