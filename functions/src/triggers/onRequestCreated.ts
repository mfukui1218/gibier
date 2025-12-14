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
    console.log("🔥 onRequestCreated fired");

    const data = event.data?.data();
    if (!data) {
      console.log("❌ no data");
      return;
    }

    // ===== 内容整形 =====
    const animal = String(data.animal ?? "");
    const part = String(data.part ?? "");
    const grams = String(data.grams ?? data.g ?? "");
    const body = `${animal ? animal + " " : ""}${part}${grams ? ` / ${grams}g` : ""}`.trim();

    // ===== アプリ内通知 =====
    await db.collection("adminNotifications").add({
      type: "request",
      title: "部位リクエストが届きました",
      body: body || "(内容なし)",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/requestlist",
      refId: event.params.requestId,
    });

    // ===== push（ここが問題の可能性）=====
    const tokens = await getAdminTokens();
    console.log("🔥 adminTokens size =", tokens.length);
    console.log("🔥 tokens =", tokens);

    if (!tokens.length) {
      console.log("⚠️ no admin tokens, skip push");
      return;
    }

    await sendPushToAdmins({
      tokens,
      title: "部位リクエストが届きました",
      body: (body || "(内容なし)").slice(0, 60),
      data: {
        url: "/admin/requestlist",
        requestId: String(event.params.requestId ?? ""),
      },
    });
    console.log("🔥 fired requestId =", event.params.requestId);
    console.log("🔥 event.id =", (event as any).id); // v2 CloudEvent の id
    console.log("✅ push sent");
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
