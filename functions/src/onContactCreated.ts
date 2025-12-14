import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const onContactCreated = onDocumentCreated(
  "contacts/{contactId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    // 管理者トークン
    const snap = await db.collection("adminTokens").get();
    const tokens: string[] = [];
    snap.forEach((d) => {
      const t = d.data()?.token;
      if (typeof t === "string" && t.length > 0) tokens.push(t);
    });
    if (tokens.length === 0) return;

    const name = String(data.name ?? "");
    const message = String(data.message ?? "");

    await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: "問い合わせが届きました",
        body: `${name ? name + "：" : ""}${message.slice(0, 60)}`,
      },
      data: {
        url: "/admin/contacts",
        contactId: event.params.contactId,
      },
    });
  }
);
