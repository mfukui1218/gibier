import * as admin from "firebase-admin";

/**
 * 同じkeyを1回だけ通すゲート
 * @returns true: 初回なので続行 / false: 重複なのでスキップ
 */
export async function shouldProcessOnce(key: string) {
  const db = admin.firestore();

  // コレクション名は何でもOK（先頭アンダースコアで「内部用」っぽく）
  const ref = db.doc(`_dedupe/${key}`);

  try {
    // create: 既に存在したら例外になる（=重複）
    await ref.create({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (e: any) {
    // 既にある = 重複
    const code = String(e?.code ?? "");
    if (code.includes("already-exists") || code.includes("ALREADY_EXISTS")) {
      return false;
    }
    // それ以外は本当のエラー
    throw e;
  }
}
