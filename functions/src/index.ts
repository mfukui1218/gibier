import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export { checkAllowedEmail, requestAllowEmail } from "./auth";
export { onNotificationCreate } from "./notifications";
export { notifyAdmins } from "./notifyAdmins";
export { onContactCreated } from "./contactsNotify";
