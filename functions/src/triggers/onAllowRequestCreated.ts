import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getAdminTokens } from "../lib/adminTokens";
import { sendPushToAdmins } from "../lib/push";
import { shouldProcessOnce } from "../lib/dedupe";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export const onAllowRequestCreated = onDocumentCreated(
  {
    document: "allowRequests/{requestId}",
    region: "us-central1",
  },
  async (event) => {
    console.log("🔥 onRequestCreated fired");
    const ok = await shouldProcessOnce(`request_${event.params.requestId}`);
    if (!ok) {
      console.log("🟡 duplicate detected -> skip");
      return;
    }
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
      expiresAt: admin.firestore.Timestamp.fromMillis(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ),
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
