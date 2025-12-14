import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getAdminTokens } from "../lib/adminTokens";
import { sendPushToAdmins } from "../lib/push";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export const onRequestCreated = onDocumentCreated(
  {
    document: "requests/{requestId}",
    region: "us-central1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const animal = String(data.animal ?? "");
    const part = String(data.part ?? "");
    const grams = String(data.grams ?? data.g ?? "");

    const body = `${animal ? animal + " " : ""}${part}${grams ? ` / ${grams}g` : ""}`.trim();

    // ① アプリ内通知
    await db.collection("adminNotifications").add({
      type: "request",
      title: "部位リクエストが届きました",
      body: body || "(内容なし)",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/requestlist",
      refId: event.params.requestId,
    });

    // ② push（スマホ通知）
    const tokens = await getAdminTokens();
    if (!tokens.length) return;

    await sendPushToAdmins({
      tokens,
      title: "部位リクエストが届きました",
      body: (body || "(内容なし)").slice(0, 60),
      data: {
        url: "/admin/requestlist",
        requestId: String(event.params.requestId ?? ""),
      },
    });
  }
);
