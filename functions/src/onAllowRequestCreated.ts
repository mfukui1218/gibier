import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const onAllowRequestCreated = onDocumentCreated(
  "allowRequests/{requestId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const email = String(data.email ?? "");

    await db.collection("adminNotifications").add({
      type: "allowRequest",
      title: "許可申請が届きました",
      body: email,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/allowed",
      refId: event.params.requestId,
    });
  }
);
