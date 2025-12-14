import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

// index.ts で一回だけ初期化
if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const notifyAdmins = onRequest(async (req, res) => {
  try {
    const { title, body, url } = req.body ?? {};

    if (!title || !body) {
      res.status(400).send("title and body are required");
      return;
    }

    // adminTokens 取得
    const snap = await db.collection("adminTokens").get();
    const tokens: string[] = [];
    snap.forEach((doc) => {
      const t = doc.data()?.token;
      if (typeof t === "string" && t.length > 0) tokens.push(t);
    });

    if (tokens.length === 0) {
      res.status(200).send("No valid tokens");
      return;
    }

    // ✅ sendMulticast ではなく sendEachForMulticast を使う
    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { url: url || "/admin" },
    });

    // 無効トークン掃除（任意だけど超おすすめ）
    const invalidIdx: number[] = [];
    result.responses.forEach((r, i) => {
      if (!r.success) invalidIdx.push(i);
    });

    // よくある：UNREGISTERED / registration-token-not-registered などはDBから消す
    // （コードは簡略。doc構造に合わせて削除して）
    // invalidIdx.forEach(i => ...tokens[i] を削除)

    res.status(200).json({
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal error");
  }
});
