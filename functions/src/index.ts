import * as admin from "firebase-admin";

export { checkAllowedEmail, requestAllowEmail } from "./auth";
export { onNotificationCreate } from "./notifications";
export { notifyAdmins } from "./notifyAdmins"; // ★これを追加

if (!admin.apps.length) {
  admin.initializeApp();
}
