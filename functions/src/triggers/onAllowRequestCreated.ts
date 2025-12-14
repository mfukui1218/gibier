import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getAdminTokens } from "../lib/adminTokens";
import { sendPushToAdmins } from "../lib/push";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export const onAllowRequestCreated = onDocumentCreated(
  {
    document: "allowRequests/{requestId}",
    region: "us-central1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const email = String(data.email ?? "");

    // ① アプリ内通知
    await db.collection("adminNotifications").add({
      type: "allowRequest",
      title: "許可申請が届きました",
      body: email,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/allowed",
      refId: event.params.requestId,
    });

    // ② push（スマホ通知）
    const tokens = await getAdminTokens();
    if (!tokens.length) return;

    await sendPushToAdmins({
      tokens,
      title: "許可申請が届きました",
      body: email.slice(0, 60),
      data: {
        url: "/admin/allowed",
        requestId: String(event.params.requestId ?? ""),
      },
    });
  }
);
