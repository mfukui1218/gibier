// functions/src/index.ts
import * as admin from "firebase-admin";
// functions/src/index.ts
export { checkAllowedEmail, requestAllowEmail } from "./auth";
export { onNotificationCreate } from "./notifications";

if (!admin.apps.length) {
  admin.initializeApp();
}
