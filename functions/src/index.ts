import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// 既存のauth系
export { checkAllowedEmail, requestAllowEmail } from "./lib/auth";

// triggers（Firestoreの作成イベント）
export { onContactCreated } from "./triggers/onContactCreated";
export { onRequestCreated } from "./triggers/onRequestCreated";
export { onAllowRequestCreated } from "./triggers/onAllowRequestCreated";

// notifyAdmins を使ってないなら export消してOK
export { notifyAdmins } from "./lib/notifyAdmins";
