// functions/src/triggers/onContactCreated.ts
import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getAdminTokens } from "../lib/adminTokens";
import { sendPushToAdmins } from "../lib/push";
import { shouldProcessOnce } from "../lib/dedupe";

const db = admin.firestore();

export const onContactCreated = onDocumentCreated(
  {
    document: "contacts/{contactId}",
    region: "us-central1",
  },
  async (event) => {
    console.log("🔥 onRequestCreated fired");
    console.log("🔥 onRequestCreated fired");
    const ok = await shouldProcessOnce(`request_${event.params.contactId}`);
    if (!ok) {
      console.log("🟡 duplicate detected -> skip");
      return;
    }
    const data = event.data?.data();
    if (!data) return;

    const name = String(data.name ?? "");
    const msg = String(data.message ?? "");
    const body = `${name ? name + "：" : ""}${msg.slice(0, 60)}`;

    // ① アプリ内通知
    await db.collection("adminNotifications").add({
      type: "contact",
      title: "問い合わせが届きました",
      body,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      url: "/admin/contacts",
      refId: event.params.contactId,
      expiresAt: admin.firestore.Timestamp.fromMillis(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ),
    });

    // ② push
    const tokens = await getAdminTokens();
    if (!tokens.length) return;

    await sendPushToAdmins({
      tokens,
      title: "問い合わせが届きました",
      body,
      data: {
        url: "/admin/contacts",
        contactId: String(event.params.contactId ?? ""),
      },
      url: "/admin/contacts",
    });
  }
);
