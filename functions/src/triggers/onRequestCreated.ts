// functions/src/triggers/onRequestCreated.ts
import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getAdminTokens } from "../lib/adminTokens";
import { shouldProcessOnce } from "../lib/dedupe";


if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const onRequestCreated = onDocumentCreated(
  {
    document: "requests/{requestId}",
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
    if (!data) {
      console.log("❌ no data");
      return;
    }

    // 表示用テキスト
    const animal = String(data.animal ?? "");
    const part = String(data.part ?? "");
    const grams = String(data.grams ?? "");
    const text = `${animal ? animal + " " : ""}${part}${grams ? ` / ${grams}g` : ""}`.trim();

    // --- アプリ内通知（DB） ---
    await db.collection("adminNotifications").add({
      type: "request",
      title: "部位リクエストが届きました",
      body: text || "(内容なし)",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/requestlist",
      refId: event.params.requestId,
    });

    // --- push通知（data-only） ---
    const tokens = await getAdminTokens();
    console.log("🔥 adminTokens =", tokens);

    if (!tokens.length) return;

    await messaging.sendEachForMulticast({
      tokens,
      // ❌ notification は絶対に書かない
      data: {
        title: "部位リクエストが届きました",
        body: (text || "(内容なし)").slice(0, 60),
        url: "/admin/requestlist",
        requestId: String(event.params.requestId),
      },
    });

    console.log("✅ push sent (data-only)");
  }
);
