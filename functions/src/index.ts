// functions/src/index.ts
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================
// 許可メールかどうかを確認
// ============================
export const checkAllowedEmail = onCall(
  { region: "us-central1" },
  async (request) => {
    const email = (request.data?.email ?? "").toLowerCase().trim();

    if (!email) {
      // ただの Error だとクライアントでは全部 "functions/internal" になるので
      // HttpsError を投げる
      throw new HttpsError("invalid-argument", "email が必要です");
    }

    const ref = db.collection("allowedEmails").doc(email);
    const snap = await ref.get();

    return { allowed: snap.exists };
  }
);

// ============================
// 許可申請を受け取る
// ============================
export const requestAllowEmail = onCall(
  { region: "us-central1" },
  async (request) => {
    const email = (request.data?.email ?? "").toLowerCase().trim();

    if (!email) {
      throw new HttpsError("invalid-argument", "email が必要です");
    }

    // すでに allowedEmails に入っていたら何もしない
    const allowedRef = db.collection("allowedEmails").doc(email);
    const allowedSnap = await allowedRef.get();

    if (allowedSnap.exists) {
      return { ok: true, alreadyAllowed: true };
    }

    // まだなら申請コレクションに追加
    await db.collection("allowRequests").add({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, alreadyAllowed: false };
  }
);
