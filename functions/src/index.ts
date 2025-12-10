import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 許可メールかどうかを確認する callable function
export const checkAllowedEmail = functions.https.onCall(async (request) => {
  // request.data の中にクライアントから渡されたデータが入る
  const data = request.data as { email?: string };

  const email = (data.email ?? "").toLowerCase().trim();

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "email が必要です"
    );
  }

  const ref = db.collection("allowedEmails").doc(email);
  const snap = await ref.get();

  return { allowed: snap.exists };
});
