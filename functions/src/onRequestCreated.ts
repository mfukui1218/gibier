import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const onRequestCreated = onDocumentCreated(
  "requests/{requestId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    // 管理者トークン取得
    const snap = await db.collection("adminTokens").get();
    const tokens: string[] = [];
    snap.forEach((d) => {
      const t = d.data()?.token;
      if (typeof t === "string" && t.length > 0) tokens.push(t);
    });
    if (tokens.length === 0) return;

    const email = String(data.email ?? "");
    const note = String(data.note ?? "");

    await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: "新しい利用申請",
        body: `${email}${note ? "：" + note.slice(0, 40) : ""}`,
      },
      data: {
        url: "/admin/allowed",
        requestId: event.params.requestId,
      },
    });
  }
);
