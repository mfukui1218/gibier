// functions/src/notifications.ts
import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

if (!admin.apps.length) admin.initializeApp();

type NotificationDoc = {
  title?: string;
  body?: string;
  url?: string;
  createdAt?: any;
};

export const onNotificationCreate = onDocumentCreated(
  {
    document: "notifications/{id}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const n = snap.data() as NotificationDoc;

    const tokensSnap = await admin.firestore().collection("adminTokens").get();
    const tokens = tokensSnap.docs.map((d) => d.id).filter(Boolean);

    if (tokens.length === 0) return;

    const url = n.url ?? "/admin/notifications";

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: n.title ?? "通知",
        body: n.body ?? "",
      },
      data: { url },
      webpush: {
        fcmOptions: { link: url },
      },
    };

    const res = await admin.messaging().sendEachForMulticast(message);

    // 失効トークン掃除
    const invalid: string[] = [];
    res.responses.forEach((r, i) => {
      if (!r.success) {
        const code = (r.error as any)?.code ?? "";
        if (
          code.includes("registration-token-not-registered") ||
          code.includes("invalid-argument")
        ) {
          invalid.push(tokens[i]);
        }
      }
    });

    if (invalid.length) {
      const batch = admin.firestore().batch();
      invalid.forEach((t) => batch.delete(admin.firestore().doc(`adminTokens/${t}`)));
      await batch.commit();
    }
  }
);
